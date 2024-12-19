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
import io.ktor.server.websocket.*
import kotlinx.serialization.json.Json
import io.ktor.websocket.*
import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import kotlinx.coroutines.channels.consumeEach
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import java.time.LocalDate
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq


@Serializable
data class ToDoCreateRequest(
    val wgId: Int,
    val title: String,
    val description: String? = null,
    val priority: Int? = null,
    val assignedTo: String? = null,  // jetzt Username statt Int
    val dueDate: String? = null
)

@Serializable
data class ToDoResponse(
    val todoId: Int,
    val wgId: Int,
    val title: String,
    val description: String?,
    val priority: Int?,
    val status: String,
    val assignedTo: String? = null,
    val dueDate: String?,
    val createdAt: String
)

@Serializable
data class ToDoMessage(
    val type: String,
    val wgId: Int,
    val data: JsonElement? = null
)

@Serializable
data class ToDoCreateData(
    val todoId: Int? = null,
    val wgId: Int,
    val title: String? = null,
    val description: String? = null,
    val priority: Int? = null,
    val assignedTo: String? = null,
    val dueDate: String? = null,
)


fun Route.toDoRoutes() {
    authenticate {
        route("/todos") {

            // Hilfsfunktion: assignedTo-Username in User-ID umwandeln und prüfen, ob dieser User in der WG ist
            fun resolveAssignedUserIdAndCheckMembership(wgId: Int, assignedUsername: String?): Int? {
                if (assignedUsername == null) return null
                return transaction {
                    val userRow = Users.select { Users.username eq assignedUsername }.singleOrNull()
                        ?: return@transaction null // Benutzername nicht gefunden

                    val assignedUserId = userRow[Users.userId]

                    // Prüfen, ob assignedUserId in der WG ist
                    val isMember = WGMembers.select {
                        (WGMembers.wgId eq wgId) and (WGMembers.userId eq assignedUserId)
                    }.count() > 0

                    if (!isMember) {
                        return@transaction null // Benutzer ist nicht in der WG
                    }

                    assignedUserId
                }
            }

            // Aufgabe erstellen
            post {
                val request = call.receive<ToDoCreateRequest>()

                if (request.priority != null && (request.priority < 1 || request.priority > 5)) {
                    call.respond(HttpStatusCode.BadRequest, "Priority muss zwischen 1 und 5 liegen oder null sein")
                    return@post
                }

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

                // assignedTo in userId auflösen
                val assignedUserId = request.assignedTo?.let {
                    resolveAssignedUserIdAndCheckMembership(request.wgId, it)
                }

                if (request.assignedTo != null && assignedUserId == null) {
                    call.respond(HttpStatusCode.BadRequest, "AssignedTo-Benutzer existiert nicht oder ist nicht in der WG")
                    return@post
                }

                // Aufgabe erstellen
                val todoId = transaction {
                    ToDos.insert {
                        it[wgId] = request.wgId
                        it[title] = request.title
                        it[description] = request.description
                        it[priority] = request.priority
                        it[status] = "Unerledigt"
                        it[assignedTo] = assignedUserId
                        it[dueDate] = request.dueDate?.let { LocalDate.parse(it) }
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

                    // Aufgaben dieser WGs mit Benutzernamen der zugewiesenen Person abrufen
                    ToDos.join(Users, JoinType.LEFT, additionalConstraint = { ToDos.assignedTo eq Users.userId })
                        .select { ToDos.wgId inList userWGs }
                        .map {
                            ToDoResponse(
                                todoId = it[ToDos.todoId],
                                wgId = it[ToDos.wgId],
                                title = it[ToDos.title],
                                description = it[ToDos.description],
                                priority = it[ToDos.priority],
                                status = it[ToDos.status],
                                assignedTo = it[Users.username],
                                dueDate = it[ToDos.dueDate]?.toString(),
                                createdAt = it[ToDos.createdAt].toString()
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

                if (request.priority != null && (request.priority < 1 || request.priority > 5)) {
                    call.respond(HttpStatusCode.BadRequest, "Priority muss zwischen 1 und 5 liegen oder null sein")
                    return@put
                }

                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asInt()

                // Aufgabe abrufen und prüfen, ob der Benutzer Mitglied der WG ist
                val wgId = transaction {
                    ToDos.select { ToDos.todoId eq todoId }.singleOrNull()?.get(ToDos.wgId)
                }

                if (wgId == null) {
                    call.respond(HttpStatusCode.NotFound, "Aufgabe nicht gefunden")
                    return@put
                }

                val isAuthorized = transaction {
                    WGMembers.select {
                        (WGMembers.wgId eq wgId) and (WGMembers.userId eq userId)
                    }.count() > 0
                }

                if (!isAuthorized) {
                    call.respond(HttpStatusCode.Forbidden, "Keine Berechtigung für diese Aufgabe")
                    return@put
                }

                // assignedTo in userId auflösen
                val assignedUserId = request.assignedTo?.let {
                    resolveAssignedUserIdAndCheckMembership(wgId, it)
                }
                if (request.assignedTo != null && assignedUserId == null) {
                    call.respond(HttpStatusCode.BadRequest, "AssignedTo-Benutzer existiert nicht oder ist nicht in der WG")
                    return@put
                }

                // Aufgabe aktualisieren
                transaction {
                    ToDos.update({ ToDos.todoId eq todoId }) {
                        it[title] = request.title
                        it[description] = request.description
                        it[priority] = request.priority
                        it[assignedTo] = assignedUserId
                        it[dueDate] = request.dueDate?.let { date ->
                            LocalDate.parse(date)
                        }
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

                val wgId = transaction {
                    ToDos.select { ToDos.todoId eq todoId }.singleOrNull()?.get(ToDos.wgId)
                }

                if (wgId == null) {
                    call.respond(HttpStatusCode.NotFound, "Aufgabe nicht gefunden")
                    return@delete
                }

                // Prüfen, ob der Benutzer berechtigt ist, die Aufgabe zu löschen
                val isAuthorized = transaction {
                    WGMembers.select {
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

fun Route.toDoWebSocketRoutes() {
    val wgConnections = ConcurrentHashMap<Int, MutableSet<WebSocketSession>>().withDefault {
        Collections.synchronizedSet(mutableSetOf())
    }

    authenticate {
        route("/todos/ws") {
            webSocket("/{wgId}") {
                val wgId = call.parameters["wgId"]?.toIntOrNull()
                if (wgId == null) {
                    close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "Ungültige WG-ID"))
                    return@webSocket
                }

                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asInt()

                val isAuthorized = transaction {
                    WGMembers.select {
                        (WGMembers.wgId eq wgId) and (WGMembers.userId eq (userId!!))
                    }.count() > 0
                }

                if (!isAuthorized) {
                    close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "Keine Berechtigung für diese WG"))
                    return@webSocket
                }

                // Hilfsfunktion aus dem oberen Abschnitt:
                fun resolveAssignedUserIdAndCheckMembership(wgId: Int, assignedUsername: String?): Int? {
                    if (assignedUsername == null) return null
                    return transaction {
                        val userRow = Users.select { Users.username eq assignedUsername }.singleOrNull()
                            ?: return@transaction null // Benutzername nicht gefunden

                        val assignedUserId = userRow[Users.userId]

                        // Prüfen, ob assignedUserId in der WG ist
                        val memberCheck = WGMembers.select {
                            (WGMembers.wgId eq wgId) and (WGMembers.userId eq assignedUserId)
                        }.count() > 0

                        if (!memberCheck) return@transaction null
                        assignedUserId
                    }
                }

                val connections = wgConnections.getOrPut(wgId) { mutableSetOf() }
                connections.add(this)

                val todos = transaction {
                    ToDos.join(Users, JoinType.LEFT, additionalConstraint = { ToDos.assignedTo eq Users.userId })
                        .select { ToDos.wgId eq wgId }
                        .map {
                            ToDoResponse(
                                todoId = it[ToDos.todoId],
                                wgId = it[ToDos.wgId],
                                title = it[ToDos.title],
                                description = it[ToDos.description],
                                priority = it[ToDos.priority],
                                status = it[ToDos.status],
                                assignedTo = it[Users.username],
                                dueDate = it[ToDos.dueDate]?.toString(),
                                createdAt = it[ToDos.createdAt].toString()
                            )
                        }
                }

                // Alle vorhandenen ToDos als Initialnachricht senden
                val initialMessage = Json.encodeToString(
                    ToDoMessage(
                        type = "INITIAL",
                        wgId = wgId,
                        data = Json.encodeToJsonElement(todos) // todos in JsonElement umwandeln
                    )
                )
                send(Frame.Text(initialMessage))



                try {
                    incoming.consumeEach { frame ->
                        if (frame is Frame.Text) {
                            val receivedText = frame.readText()

                            try {
                                val message = Json.decodeFromString<ToDoMessage>(receivedText)

                                when (message.type) {
                                    "CREATE" -> {
                                        val data = Json.decodeFromJsonElement<ToDoCreateData>(message.data!!)
                                        if (data.priority != null && (data.priority < 1 || data.priority > 5)) {
                                            send(Frame.Text("Fehler: Priority muss zwischen 1 und 5 liegen oder null sein"))
                                            return@webSocket
                                        }

                                        val assignedUserId = resolveAssignedUserIdAndCheckMembership(wgId, data.assignedTo)
                                        if (data.assignedTo != null && assignedUserId == null) {
                                            send(Frame.Text("Fehler: Assigned User nicht gefunden oder nicht in WG"))
                                            return@webSocket
                                        }
                                        if (data.title == null) {
                                            send(Frame.Text("Fehler: Title ist erforderlich"))
                                            return@webSocket
                                        }

                                        val newToDoId = transaction {
                                            ToDos.insert {
                                                it[ToDos.wgId] = wgId
                                                it[title] = data.title
                                                it[description] = data.description
                                                it[priority] = data.priority
                                                it[status] = "Unerledigt"
                                                it[assignedTo] = assignedUserId
                                                it[dueDate] = data.dueDate?.let { date -> LocalDate.parse(date) }
                                                it[createdAt] = LocalDateTime.now()
                                            } get ToDos.todoId
                                        }

                                        val newToDo = transaction {
                                            ToDos.join(Users, JoinType.LEFT, additionalConstraint = { ToDos.assignedTo eq Users.userId })
                                                .select { ToDos.todoId eq newToDoId }.single().let {
                                                    ToDoResponse(
                                                        todoId = it[ToDos.todoId],
                                                        wgId = it[ToDos.wgId],
                                                        title = it[ToDos.title],
                                                        description = it[ToDos.description],
                                                        priority = it[ToDos.priority],
                                                        status = it[ToDos.status],
                                                        assignedTo = it[Users.username],
                                                        dueDate = it[ToDos.dueDate]?.toString(),
                                                        createdAt = it[ToDos.createdAt].toString()
                                                    )
                                                }
                                        }

                                        val jsonResponse = Json.encodeToString(
                                            ToDoMessage(
                                                "CREATE",
                                                wgId,
                                                Json.encodeToJsonElement(newToDo)
                                            )
                                        )

                                        connections.forEach { conn ->
                                            try {
                                                conn.send(Frame.Text(jsonResponse))
                                            } catch (e: Exception) {
                                                connections.remove(conn)
                                            }
                                        }
                                    }

                                    "UPDATE" -> {
                                        val data = Json.decodeFromJsonElement<ToDoCreateData>(message.data!!)
                                        if (data.todoId == null) {
                                            send(Frame.Text("Fehler: Keine todoId für UPDATE übergeben"))
                                            return@webSocket
                                        }
                                        if (data.title == null) {
                                            send(Frame.Text("Fehler: Title ist erforderlich"))
                                            return@webSocket
                                        }

                                        val assignedUserId = resolveAssignedUserIdAndCheckMembership(wgId, data.assignedTo)
                                        if (data.assignedTo != null && assignedUserId == null) {
                                            send(Frame.Text("Fehler: Assigned User nicht gefunden oder nicht in WG"))
                                            return@webSocket
                                        }

                                        transaction {
                                            ToDos.update({ ToDos.todoId eq data.todoId }) {
                                                it[title] = data.title
                                                it[description] = data.description
                                                it[priority] = data.priority
                                                it[assignedTo] = assignedUserId
                                                it[dueDate] = data.dueDate?.let { date -> LocalDate.parse(date) }
                                            }
                                        }

                                        val jsonResponse = Json.encodeToString(
                                            ToDoMessage(
                                                "UPDATE",
                                                wgId,
                                                Json.encodeToJsonElement(data)
                                            )
                                        )

                                        connections.forEach { conn ->
                                            try {
                                                conn.send(Frame.Text(jsonResponse))
                                            } catch (e: Exception) {
                                                connections.remove(conn)
                                            }
                                        }
                                    }

                                    "DELETE" -> {
                                        val data = Json.decodeFromJsonElement<ToDoCreateData>(message.data!!)
                                        if (data.todoId == null) {
                                            send(Frame.Text("Fehler: Keine Daten"))
                                            return@webSocket
                                        }

                                        transaction {
                                            ToDos.deleteWhere { todoId eq (data.todoId) }
                                        }

                                        val jsonResponse = Json.encodeToString(
                                            ToDoMessage(
                                                "DELETE",
                                                wgId,
                                                Json.encodeToJsonElement(data)
                                            )
                                        )

                                        connections.forEach { conn ->
                                            try {
                                                conn.send(Frame.Text(jsonResponse))
                                            } catch (e: Exception) {
                                                connections.remove(conn)
                                            }
                                        }
                                    }
                                }
                            } catch (e: Exception) {
                                println("Fehler beim Dekodieren der Nachricht: ${e.message}")
                                send(Frame.Text("Fehler: Ungültige Nachricht"))
                            }
                        }
                    }
                } finally {
                    connections.remove(this)
                    println("Verbindung für WG $wgId entfernt")
                }
            }
        }
    }
}
