package com.wgorganizer.models

import org.jetbrains.exposed.sql.Table

object WGMembers : Table() {
    val wgId = integer("wg_id").references(WGs.wgId)
    val userId = integer("user_id").references(Users.userId)
    override val primaryKey = PrimaryKey(wgId, userId)
}
