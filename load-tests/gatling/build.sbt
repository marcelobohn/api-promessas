val gatlingVersion = "3.9.5"

ThisBuild / scalaVersion := "2.13.12"
ThisBuild / organization := "com.api.promessas"

lazy val gatlingTests = (project in file("."))
  .settings(
    name := "api-promessas-gatling",
    libraryDependencies ++= Seq(
      "io.gatling.highcharts" % "gatling-charts-highcharts" % gatlingVersion % Test,
      "io.gatling" % "gatling-test-framework" % gatlingVersion % Test,
      "io.gatling" % "gatling-http" % gatlingVersion % Test
    ),
    Test / fork := true,
    Test / parallelExecution := false
  )
