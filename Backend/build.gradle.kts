val kotlin_version: String by project
val logback_version: String by project
val exposed_version: String by project
val h2_version: String by project

plugins {
    application
    kotlin("jvm") version "2.0.21"
    id("io.ktor.plugin") version "3.0.0"
    id("org.jetbrains.kotlin.plugin.serialization") version "2.0.21"
}

group = "com.ktor"
version = "0.0.1"

application {
    mainClass.set("com.wgorganizer.ApplicationKt")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

repositories {
    mavenCentral()
    gradlePluginPortal()
}

dependencies {
    implementation("io.ktor:ktor-server-core:2.x.x")
    implementation("io.ktor:ktor-server-netty:2.x.x")
    implementation("io.ktor:ktor-server-auth:2.x.x")
    implementation("io.ktor:ktor-server-auth-jwt:2.x.x")
    implementation("io.ktor:ktor-server-content-negotiation:2.x.x")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.x.x")
    implementation("org.jetbrains.exposed:exposed-core:0.36.2")
    implementation("org.jetbrains.exposed:exposed-dao:0.36.2")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.36.2")
    implementation("org.postgresql:postgresql:42.3.1")
    implementation("io.ktor:ktor-server-core:2.3.2")
    implementation("io.ktor:ktor-server-netty:2.3.2")
    implementation("io.ktor:ktor-server-auth:2.3.2")
    implementation("io.ktor:ktor-server-auth-jwt:2.3.2")
    implementation("io.ktor:ktor-server-sessions:2.3.2")
    implementation("io.ktor:ktor-server-websockets:2.3.2")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.2")
    implementation("org.mindrot:jbcrypt:0.4")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.2")
    implementation("org.jetbrains.exposed:exposed-core:0.41.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.41.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.41.1")
    implementation("org.postgresql:postgresql:42.6.0")
    implementation("ch.qos.logback:logback-classic:1.4.11")
    implementation("org.jetbrains.exposed:exposed-java-time:0.41.1")
    testImplementation("io.ktor:ktor-server-tests:2.3.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:1.8.0")
}
