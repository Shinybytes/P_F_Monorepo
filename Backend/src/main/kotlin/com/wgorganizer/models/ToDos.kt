package com.wgorganizer.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime

object ToDos : Table() {
    val todoId = integer("todo_id").autoIncrement()
    val wgId = integer("wg_id").references(WGs.wgId)
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val status = varchar("status", 20)
    val priority = integer("priority")
    val assignedTo = integer("assigned_to").references(Users.userId).nullable()
    val dueDate = datetime("due_date").nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(todoId)
}
