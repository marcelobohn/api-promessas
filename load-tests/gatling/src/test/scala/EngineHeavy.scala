import io.gatling.app.Gatling
import io.gatling.core.config.GatlingPropertiesBuilder

object EngineHeavy {
  def main(args: Array[String]): Unit = {
    val simulationClassName = Option(System.getProperty("gatling.simulationClass"))
      .orElse(Option(System.getProperty("simulationClass")))
      .getOrElse(classOf[CandidateFlowHeavySimulation].getName)

    val props = new GatlingPropertiesBuilder()
      .simulationClass(simulationClassName)
      .build

    Gatling.fromMap(props)
  }
}
