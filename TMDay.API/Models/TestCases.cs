namespace TMDay.API.Models
{
    public class TestCases
    {
        public int TcId { get; set; }
        public string TcName { get; set; }
        public string TcEpic { get; set; }
        public string TcApp { get; set; }
        public string TcComponent { get; set; }
        public string TcStory { get; set; }
        public string TcAssigned { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<TestScenarios> TestScenarios { get; set; } = new List<TestScenarios>();
    }
}