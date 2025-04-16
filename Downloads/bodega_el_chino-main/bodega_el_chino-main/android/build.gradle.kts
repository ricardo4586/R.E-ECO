allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

buildscript {
    ext.kotlin_version = '1.9.22' // Verifica tu versión de Kotlin
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        // Necesitas el plugin de Gradle para Android
        classpath 'com.android.tools.build:gradle:8.1.4' // Asegúrate de tener la versión correcta
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        // 🔑 AGREGAR ESTA LÍNEA (Google Services Plugin)
        classpath 'com.google.gms:google-services:4.4.1' // Usar la última versión estable
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
