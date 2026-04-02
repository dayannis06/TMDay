namespace TMDay.API.Models;
public enum Status
{
    ToDo,
    InProgress,
    Approved,
    Failed,
    Blocked,
    Canceled
}

public enum ScenarioTypes
{
    Functional,
    NonFunctional,
    Regression,
    Smoke,
    Sanity,
    Exploratory
}

public class TestScenarios
{
    public int Id { get; set; }
    public int TcId { get; set; }
    public string Name { get; set; }
    public string PreRequisites { get; set; }
    public string Data { get; set; }
    public string Steps { get; set; }
    public string ExpectedResult { get; set; }
    public string ActualResult { get; set; }
    public Status Status { get; set; }
    public ScenarioTypes Type { get; set; }
}