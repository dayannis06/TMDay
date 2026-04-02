namespace TMDay.API.Models
{
    // Wrapper class only for JSON deserialization of the root testCases property
    public class TestDataWrapper
    {
        public List<TestCases> TestCases { get; set; } = new List<TestCases>();
    }
}
