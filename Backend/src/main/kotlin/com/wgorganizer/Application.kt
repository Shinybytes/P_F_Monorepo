package com.wgorganizer

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import com.wgorganizer.database.DatabaseFactory
import com.wgorganizer.routes.authRoutes
import com.wgorganizer.routes.wgRoutes
import com.wgorganizer.routes.toDoRoutes
import com.wgorganizer.security.JWTConfig.configureSecurity
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.routing.*

fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()
    configureSecurity(this)
    install(ContentNegotiation) {
        json()
    }
    routing {
        authRoutes()
        wgRoutes()
        toDoRoutes()
    }
}
