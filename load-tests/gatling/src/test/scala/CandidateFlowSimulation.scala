import io.gatling.core.Predef._
import io.gatling.http.Predef._
import java.util.UUID

class CandidateFlowSimulation extends Simulation {

  private val baseUrl = System.getProperty("baseUrl", "http://localhost:3000")

  private val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .disableWarmUp
    .shareConnections

  private val userFeeder = Iterator.continually {
    val uuid = UUID.randomUUID().toString.take(8)
    Map(
      "name" -> s"Load Tester $uuid",
      "email" -> s"load_${uuid}@teste.com",
      "password" -> "SenhaSegura123!"
    )
  }

  private val candidateFeeder = Iterator.continually {
    val uuid = UUID.randomUUID().toString.take(6)
    Map(
      "candidateName" -> s"Candidate-$uuid",
      "officeId" -> 5,
      "stateCode" -> 35,
      "electionId" -> 10,
      "partyId" -> 99      
    )
  }

  private val registerAndLogin = feed(userFeeder)
    .exec(
      http("register")
        .post("/api/v1/auth/register")
        .body(StringBody("""{"name":"${name}","email":"${email}","password":"${password}"}"""))
        .check(status.is(201), jsonPath("$.token").saveAs("token"))
    )
    .exitHereIfFailed

  private val createCandidate = feed(candidateFeeder)
    .exec(session => session.set("authHeader", s"Bearer ${session("token").as[String]}"))
    .exec(
      http("create_candidate")
        .post("/api/v1/candidates")
        .header("Authorization", "${authHeader}")
        .body(StringBody(
          """{
            "name": "${candidateName}",
            "office_id": ${officeId},
            "state_code": ${stateCode},
            "election_id": ${electionId},
            "political_party_id": ${partyId}
          }"""
        ))
        .check(status.in(201, 400, 401, 404), jsonPath("$.id").optional.saveAs("candidateId"))
    )

  private val listCandidates = exec(
    http("list_candidates")
      .get("/api/v1/candidates?officeId=${officeId}&state_code=${stateCode}")
      .check(status.is(200))
  )

  private val listPromises = exec { session =>
    val candidateId = session("candidateId").asOption[Any].getOrElse(1)
    session.set("candidateIdResolved", candidateId)
  }.exec(
    http("list_promises")
      .get("/api/v1/candidates/${candidateIdResolved}/promises")
      .check(status.in(200, 404))
  )

  private val scn = scenario("CandidateFlow")
    .exec(registerAndLogin)
    .pause(1)
    .exec(createCandidate)
    .pause(1)
    .exec(listCandidates)
    .pause(1)
    .exec(listPromises)

  setUp(
    scn.inject(
      rampUsersPerSec(1).to(5).during(20),
      constantUsersPerSec(5).during(40)
    )
  ).protocols(httpProtocol)
    .maxDuration(120)
    .assertions(
      global.successfulRequests.percent.gte(90),
      global.responseTime.percentile3.lt(1500)
    )
}
