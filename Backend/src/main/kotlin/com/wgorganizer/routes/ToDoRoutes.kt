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
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


@Serializable
data class ToDoCreateRequest(
    val wgId: Int,
    val title: String,
    val description: String? = null,
    val priority: Int = 3,
    val assignedTo: Int? = null,
    val dueDate: String? = null
)

@Serializable
data class ToDoResponse(
    val todoId: Int,
    val wgId: Int,
    val title: String,
    val description: String?,
    val priority: Int,
    val status: String,
    val assignedTo: Int?,
    val dueDate: String?,
    val createdAt: String
)

fun Route.toDoRoutes() {
    authenticate {
        route("/todos") {

            // Aufgabe erstellen
            post {
                val request = call.receive<ToDoCreateRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                // Prüfen, ob der Benutzer Mitglied der WG ist
                val isMember = transaction {
                    WGMembers.select {
                        (WGMembers.wgId eq request.wgId) and (WGMembers.userId eq userId)
                    }.count() > 0
                }

                if (!isMember) {
                    call.respond(HttpStatusCode.Forbidden, "Keine Berechtigung für diese WG")
                    return@post
                }

                // Aufgabe erstellen
                val todoId = transaction {
                    ToDos.insert {
                        it[wgId] = request.wgId
                        it[title] = request.title
                        it[description] = request.description
                        it[priority] = request.priority
                        it[status] = "Pending"
                        it[assignedTo] = request.assignedTo
                        it[dueDate] = request.dueDate?.let { LocalDateTime.parse(it) }
                        it[createdAt] = LocalDateTime.now()
                    } get ToDos.todoId
                }

                call.respond(HttpStatusCode.Created, mapOf("todoId" to todoId))
            }

            // Aufgaben der WG abrufen
            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                val todos = transaction {
                    // WGs, in denen der Benutzer Mitglied ist
                    val userWGs = WGMembers.select { WGMembers.userId eq userId }.map { it[WGMembers.wgId] }

                    // Aufgaben dieser WGs abrufen
                    ToDos.select { ToDos.wgId inList userWGs }.map {
                        ToDoResponse(
                            it[ToDos.todoId],
                            it[ToDos.wgId],
                            it[ToDos.title],
                            it[ToDos.description],
                            it[ToDos.priority],
                            it[ToDos.status],
                            it[ToDos.assignedTo],
                            it[ToDos.dueDate]?.toString(),
                            it[ToDos.createdAt].toString()
                        )
                    }
                }

                call.respond(todos)
            }

            // Aufgabe aktualisieren
            put("/{id}") {
                val todoId = call.parameters["id"]?.toIntOrNull()
                if (todoId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Ungültige ToDo-ID")
                    return@put
                }

                val request = call.receive<ToDoCreateRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                // Aufgabe abrufen und prüfen, ob der Benutzer Mitglied der WG ist
                val isAuthorized = transaction {
                    val todo = ToDos.select { ToDos.todoId eq todoId }.singleOrNull()
                    val wgId = todo?.get(ToDos.wgId)

                    wgId != null && WGMembers.select {
                        (WGMembers.wgId eq wgId) and (WGMembers.userId eq userId)
                    }.count() > 0
                }

                if (!isAuthorized) {
                    call.respond(HttpStatusCode.Forbidden, "Keine Berechtigung für diese Aufgabe")
                    return@put
                }

                // Aufgabe aktualisieren
                transaction {
                    ToDos.update({ ToDos.todoId eq todoId }) {
                        it[title] = request.title
                        it[description] = request.description
                        it[priority] = request.priority
                        it[assignedTo] = request.assignedTo
                        it[dueDate] = request.dueDate?.let { LocalDateTime.parse(it) }
                    }
                }

                call.respond(HttpStatusCode.OK, "Aufgabe aktualisiert")
            }

            // Aufgabe löschen
            delete("/{id}") {
                val todoId = call.parameters["id"]?.toIntOrNull()
                if (todoId == null) {
                    call.respond(HttpStatusCode.BadRequest, "Ungültige ToDo-ID")
                    return@delete
                }

                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                // Prüfen, ob der Benutzer berechtigt ist, die Aufgabe zu löschen
                val isAuthorized = transaction {
                    val todo = ToDos.select { ToDos.todoId eq todoId }.singleOrNull()
                    val wgId = todo?.get(ToDos.wgId)

                    wgId != null && WGMembers.select {
                        (WGMembers.wgId eq wgId) and (WGMembers.userId eq userId)
                    }.count() > 0
                }

                if (!isAuthorized) {
                    call.respond(HttpStatusCode.Forbidden, "Keine Berechtigung für diese Aufgabe")
                    return@delete
                }

                // Aufgabe löschen
                transaction {
                    ToDos.deleteWhere { ToDos.todoId eq todoId }
                }

                call.respond(HttpStatusCode.OK, "Aufgabe gelöscht")
            }
        }
    }
}
