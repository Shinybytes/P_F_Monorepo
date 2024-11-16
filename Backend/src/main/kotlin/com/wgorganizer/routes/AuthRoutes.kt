package com.wgorganizer.routes

import io.ktor.server.routing.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import com.wgorganizer.models.Users
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.wgorganizer.security.JWTConfig
import io.ktor.server.auth.*
import io.ktor.http.*
import io.ktor.server.auth.jwt.*
import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import org.mindrot.jbcrypt.BCrypt

@Serializable
data class UserRegisterRequest(val username: String, val email: String, val password: String)

@Serializable
data class UserLoginRequest(val email: String, val password: String)

@Serializable
data class UserProfileResponse(val userId: Int, val username: String, val email: String)

fun Route.authRoutes() {
    route("/auth") {
        post("/register") {
            val request = call.receive<UserRegisterRequest>()
            val passwordHash = BCrypt.hashpw(request.password, BCrypt.gensalt())

            val userId = transaction {
                if (Users.select { Users.email eq request.email }.count() > 0) {
                    call.respond(HttpStatusCode.Conflict, "Email bereits registriert")
                    return@transaction null
                }

                Users.insert {
                    it[username] = request.username
                    it[email] = request.email
                    it[passwordHash] = passwordHash
                    it[createdAt] = LocalDateTime.now()
                } get Users.userId
            } ?: return@post

            call.respond(HttpStatusCode.Created, mapOf("userId" to userId))
        }

        post("/login") {
            val request = call.receive<UserLoginRequest>()

            val user = transaction {
                Users.select { Users.email eq request.email }.singleOrNull()
            }

            if (user == null || !BCrypt.checkpw(request.password, user[Users.passwordHash])) {
                call.respond(HttpStatusCode.Unauthorized, "Ungültige Anmeldedaten")
                return@post
            }

            val token = `JWTConfig`.generateToken(user[Users.userId])
            call.respond(mapOf("token" to token))
        }

        authenticate {
            get("/profile") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                val user = transaction {
                    Users.select { Users.userId eq userId }.singleOrNull()
                }

                if (user == null) {
                    call.respond(HttpStatusCode.NotFound, "Benutzer nicht gefunden")
                    return@get
                }

                call.respond(UserProfileResponse(user[Users.userId], user[Users.username], user[Users.email]))
            }

            put("/profile") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()
                val request = call.receive<UserRegisterRequest>() // Reuse the data class for simplicity

                transaction {
                    Users.update({ Users.userId eq userId }) {
                        it[username] = request.username
                        it[email] = request.email
                        if (request.password.isNotBlank()) {
                            it[passwordHash] = BCrypt.hashpw(request.password, BCrypt.gensalt())
                        }
                    }
                }

                call.respond(HttpStatusCode.OK, "Profil aktualisiert")
            }
        }
    }
}
