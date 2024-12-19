package com.wgorganizer

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import com.wgorganizer.database.DatabaseFactory
import com.wgorganizer.routes.authRoutes
import com.wgorganizer.routes.wgRoutes
import com.wgorganizer.routes.toDoRoutes
import com.wgorganizer.routes.wgChatRoutes
import com.wgorganizer.routes.toDoWebSocketRoutes
import com.wgorganizer.security.JWTConfig.configureSecurity
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import kotlin.time.Duration.Companion.seconds
fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module).start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()
    configureSecurity(this)

    install(ContentNegotiation) {
        json()
    }

    install(CORS) {
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        anyHost()
    }
    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 30.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    routing {
        authRoutes()
        wgRoutes()
        toDoRoutes()
        wgChatRoutes()
        toDoWebSocketRoutes()

    }
}
