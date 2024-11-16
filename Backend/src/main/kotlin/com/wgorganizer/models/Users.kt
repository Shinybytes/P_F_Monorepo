package com.wgorganizer.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object Users : Table() {
    val userId = integer("user_id").autoIncrement()
    val username = varchar("username", 50)
    val email = varchar("email", 100).uniqueIndex()
    val passwordHash = varchar("password_hash", 64)
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(userId)
}
