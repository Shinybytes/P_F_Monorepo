package com.wgorganizer.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.server.auth.jwt.*
import io.ktor.server.auth.*
import io.ktor.server.application.*
import kotlin.time.Duration.Companion.hours
import kotlin.time.toJavaDuration

object JWTConfig {
    private val secret = "wepfkndvepkbyxmvepbxäöükfjhgehfw"
    private val issuer = "wgorganizer"
    private val audience = "wgorganizerAudience"
    private val realm = "wgorganizerRealm"
    private val algorithm = Algorithm.HMAC256(secret)

    fun generateToken(userId: Int): String {
        return JWT.create()
            .withAudience(audience)
            .withIssuer(issuer)
            .withClaim("userId", userId)
            .withExpiresAt(java.util.Date(System.currentTimeMillis() + 1.hours.toJavaDuration().toMillis()))
            .sign(algorithm)
    }

    fun configureSecurity(application: Application) {
        application.install(Authentication) {
            jwt {
                realm = JWTConfig.realm
                verifier(
                    JWT
                        .require(algorithm)
                        .withAudience(audience)
                        .withIssuer(issuer)
                        .build()
                )
                validate { credential ->
                    if (credential.payload.getClaim("userId").asInt() != null) {
                        JWTPrincipal(credential.payload)
                    } else {
                        null
                    }
                }
            }
        }
    }
}
