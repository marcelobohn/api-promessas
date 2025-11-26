import io.gatling.app.Gatling
import io.gatling.core.config.GatlingPropertiesBuilder

object Engine {
  def main(args: Array[String]): Unit = {
    val props = new GatlingPropertiesBuilder()
      .simulationClass(classOf[CandidateFlowSimulation].getName)
      .build

    Gatling.fromMap(props)
  }
}
