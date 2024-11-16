package com.wgorganizer.database

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import com.wgorganizer.models.Users
import com.wgorganizer.models.WGs
import com.wgorganizer.models.ToDos
import com.wgorganizer.models.WGMembers
import io.ktor.server.application.*
import io.ktor.server.config.*
import com.typesafe.config.ConfigFactory

object DatabaseFactory {
    fun init() {
        val config = HoconApplicationConfig(ConfigFactory.load())
        val driverClassName = config.property("database.driver").getString()
        val jdbcURL = config.property("database.url").getString()
        val user = config.property("database.user").getString()
        val password = config.property("database.password").getString()
        Database.connect(jdbcURL, driver = driverClassName, user = user, password = password)
        transaction {
            SchemaUtils.create(Users, WGs, ToDos, WGMembers)
        }
    }
}
