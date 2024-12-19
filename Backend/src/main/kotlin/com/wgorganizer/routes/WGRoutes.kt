package com.wgorganizer.routes

import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import com.wgorganizer.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import io.ktor.server.auth.*
import io.ktor.http.*
import io.ktor.server.auth.jwt.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class WGCreateRequest(val name: String)

@Serializable
data class WGJoinRequest(val joinCode: String)

@Serializable
data class WGResponse(val wgId: Int, val name: String, val joinCode: String, val createdAt: String)

@Serializable
data class UserResponse(val userId: Int, val username: String, val email: String, val createdAt: String)


fun Route.wgRoutes() {
    authenticate {
        route("/wg") {
            post {
                val request = call.receive<WGCreateRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                val wgId = newSuspendedTransaction {
                    if (WGs.select { WGs.name eq request.name }.count() > 0) {
                        call.respond(HttpStatusCode.Conflict, "WG-Name bereits vergeben")
                        return@newSuspendedTransaction null
                    }

                    val joinCode = UUID.randomUUID().toString()

                    val newWgId = WGs.insert {
                        it[name] = request.name
                        it[createdAt] = LocalDateTime.now()
                        it[WGs.joinCode] = joinCode
                    } get WGs.wgId

                    WGMembers.insert {
                        it[wgId] = newWgId
                        it[WGMembers.userId] = userId
                    }

                    newWgId
                } ?: return@post

                val wg = transaction {
                    WGs.select { WGs.wgId eq wgId }.single()
                }

                call.respond(
                    HttpStatusCode.Created,
                    WGResponse(
                        wgId = wg[WGs.wgId],
                        name = wg[WGs.name],
                        joinCode = wg[WGs.joinCode],
                        createdAt = wg[WGs.createdAt].toString()
                    )
                )
            }

            post("/join") {
                val request = call.receive<WGJoinRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                newSuspendedTransaction {
                    val wg = WGs.select { WGs.joinCode eq request.joinCode }.singleOrNull()
                        ?: return@newSuspendedTransaction call.respond(HttpStatusCode.NotFound, "Ungültiger Code")

                    if (WGMembers.select { (WGMembers.wgId eq wg[WGs.wgId]) and (WGMembers.userId eq userId) }.count() > 0) {
                        return@newSuspendedTransaction call.respond(HttpStatusCode.Conflict, "Benutzer ist bereits Mitglied in dieser WG")
                    }

                    WGMembers.insert {
                        it[wgId] = wg[WGs.wgId]
                        it[WGMembers.userId] = userId
                    }

                    call.respond(HttpStatusCode.OK, "Erfolgreich der WG beigetreten")
                }
            }

            get("/{id}") {
                val wgId = call.parameters["id"]?.toIntOrNull()
                if (wgId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Ungültige WG-ID")
                    return@get
                }

                val wg = transaction {
                    WGs.select { WGs.wgId eq wgId }.singleOrNull()
                }

                if (wg == null) {
                    call.respond(HttpStatusCode.NotFound, "WG nicht gefunden")
                    return@get
                }

                call.respond(
                    WGResponse(
                        wg[WGs.wgId],
                        wg[WGs.name],
                        wg[WGs.joinCode],
                        wg[WGs.createdAt].toString()

                    )
                )
            }
            get("/{id}/members") {
                val wgId = call.parameters["id"]?.toIntOrNull()
                if (wgId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Ungültige WG-ID")
                    return@get
                }

                // Überprüfen, ob die WG existiert
                val wgExists = transaction {
                    WGs.select { WGs.wgId eq wgId }.count() > 0
                }

                if (!wgExists) {
                    call.respond(HttpStatusCode.NotFound, "WG nicht gefunden")
                    return@get
                }

                // Mitglieder der WG abrufen
                val members = transaction {
                    (WGMembers innerJoin Users)
                        .slice(Users.userId, Users.username, Users.email, Users.createdAt)
                        .select { WGMembers.wgId eq wgId }
                        .map {
                            UserResponse(
                                userId = it[Users.userId],
                                username = it[Users.username],
                                email = it[Users.email],
                                createdAt = it[Users.createdAt].toString()
                            )
                        }
                }

                call.respond(members)
            }
        }
    }
}
