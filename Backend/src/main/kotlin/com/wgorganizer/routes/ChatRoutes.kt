package com.wgorganizer.routes
import io.ktor.http.*
import io.ktor.websocket.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import kotlinx.coroutines.channels.consumeEach
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import com.wgorganizer.models.*
import io.ktor.server.websocket.*
import kotlinx.serialization.encodeToString


@Serializable
data class WGChatMessage(val wgId: Int, val senderId: Int, val content: String)

@Serializable
data class CreateMessageResponse(val messageId: Int, val wgId: Int, val senderId: Int, val content: String, val sentAt: String)


fun Route.wgChatRoutes() {
    route("/wgchat") {

        // REST-Endpunkt: Nachrichten für eine WG abrufen
        get("/{wgId}/messages") {
            val wgId = call.parameters["wgId"]?.toIntOrNull()
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

            // Nachrichten für die WG abrufen
            val messages = transaction {
                WGChats.select { WGChats.wgId eq wgId }
                    .orderBy(WGChats.sentAt, SortOrder.ASC)
                    .map {
                        CreateMessageResponse(
                            messageId = it[WGChats.messageId],
                            wgId = it[WGChats.wgId],
                            senderId = it[WGChats.senderId],
                            content = it[WGChats.content],
                            sentAt = it[WGChats.sentAt].toString()
                        )
                    }
            }
            call.respond(messages)
        }

        webSocket("/{wgId}") {
            val wgId = call.parameters["wgId"]?.toIntOrNull()
            if (wgId == null) {
                close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "Ungültige WG-ID"))
                return@webSocket
            }

            // Überprüfen, ob die WG existiert
            val wgExists = transaction {
                WGs.select { WGs.wgId eq wgId }.count() > 0
            }
            if (!wgExists) {
                close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "WG nicht gefunden"))
                return@webSocket
            }

            // Nachrichten für die WG abrufen
            val messages = transaction {
                WGChats.select { WGChats.wgId eq wgId }
                    .orderBy(WGChats.sentAt, SortOrder.ASC)
                    .map {
                        CreateMessageResponse(
                            messageId = it[WGChats.messageId],
                            wgId = it[WGChats.wgId],
                            senderId = it[WGChats.senderId],
                            content = it[WGChats.content],
                            sentAt = it[WGChats.sentAt].toString()
                        )
                    }
            }

            // Initiale Nachrichten senden
            val initialMessage = Json.encodeToString(messages)
            send(Frame.Text(initialMessage))

            // Verbindungen verwalten
            val connections = mutableSetOf<WebSocketSession>()

            connections.add(this)

            try {
                // Nachrichten empfangen
                incoming.consumeEach { frame ->
                    if (frame is Frame.Text) {
                        val text = frame.readText()
                        val message = Json.decodeFromString<WGChatMessage>(text)

                        if (message.wgId != wgId) {
                            send(Frame.Text("Ungültige Nachricht: WG-ID stimmt nicht überein."))
                            return@consumeEach
                        }

                        // Nachricht in der Datenbank speichern
                        transaction {
                            WGChats.insert {
                                it[WGChats.wgId] = message.wgId
                                it[senderId] = message.senderId
                                it[content] = message.content
                                it[sentAt] = LocalDateTime.now()
                            }
                        }

                        // Nachricht an alle Verbindungen senden
                        connections.forEach {
                            it.send(Frame.Text(text))
                        }
                    }
                }
            } finally {
                // Verbindung entfernen, wenn sie geschlossen wird
                connections.remove(this)
            }
        }
    }
}
