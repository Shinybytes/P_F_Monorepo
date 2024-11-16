package com.wgorganizer.routes

import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import com.wgorganizer.models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import io.ktor.server.auth.*
import io.ktor.http.*
import io.ktor.server.auth.jwt.*
import kotlinx.serialization.Serializable
import java.time.LocalDateTime

@Serializable
data class WGCreateRequest(val name: String)

@Serializable
data class WGJoinRequest(val name: String)

@Serializable
data class WGResponse(val wgId: Int, val name: String, val createdAt: String)

fun Route.wgRoutes() {
    authenticate {
        route("/wg") {
            post {
                val request = call.receive<WGCreateRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                val wgId = transaction {
                    if (WGs.select { WGs.name eq request.name }.count() > 0) {
                        call.respond(HttpStatusCode.Conflict, "WG-Name bereits vergeben")
                        return@transaction null
                    }

                    val newWgId = WGs.insert {
                        it[name] = request.name
                        it[createdAt] = LocalDateTime.now()
                    } get WGs.wgId

                    WGMembers.insert {
                        it[WGMembers.wgId] = newWgId
                        it[WGMembers.userId] = userId
                    }

                    newWgId
                } ?: return@post

                call.respond(HttpStatusCode.Created, mapOf("wgId" to wgId))
            }

            post("/join") {
                val request = call.receive<WGJoinRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                transaction {
                    val wg = WGs.select { WGs.name eq request.name }.singleOrNull()
                        ?: return@transaction call.respond(HttpStatusCode.NotFound, "WG nicht gefunden")

                    if (WGMembers.select { (WGMembers.wgId eq wg[WGs.wgId]) and (WGMembers.userId eq userId) }.count() > 0) {
                        return@transaction call.respond(HttpStatusCode.Conflict, "Benutzer ist bereits Mitglied in dieser WG")
                    }

                    WGMembers.insert {
                        it[WGMembers.wgId] = wg[WGs.wgId]
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
                        wg[WGs.createdAt].toString()
                    )
                )
            }
        }
    }
}
