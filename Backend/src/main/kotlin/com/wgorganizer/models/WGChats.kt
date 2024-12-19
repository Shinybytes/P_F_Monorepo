package com.wgorganizer.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object WGChats : Table() {
    val messageId = integer("message_id").autoIncrement() // Eindeutige Nachricht-ID
    val wgId = integer("wg_id").references(WGs.wgId) // Verweis auf die WG
    val senderId = integer("sender_id") // Benutzer, der die Nachricht gesendet hat
    val content = text("content") // Nachrichtentext
    val sentAt = datetime("sent_at") // Zeitpunkt der Nachricht
    override val primaryKey = PrimaryKey(messageId)
}

