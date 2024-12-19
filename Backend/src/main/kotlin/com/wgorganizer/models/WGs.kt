package com.wgorganizer.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object WGs : Table() {
    val wgId = integer("wg_id").autoIncrement()
    val name = varchar("name", 100).uniqueIndex()
    val createdAt = datetime("created_at")
    val joinCode = varchar("join_code", 36)
    override val primaryKey = PrimaryKey(wgId)
}
