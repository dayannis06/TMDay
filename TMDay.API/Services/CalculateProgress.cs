using System;
using System.Collections.Generic;
using System.Linq;
using TMDay.API.Models;

public class ProgressItem
{
  public string State { get; init; } = "";
  public int Count { get; init; }
  public double Percentage { get; init; }
 
}

public static class ProgressCalculator
{
  public static List<ProgressItem> CalculateProgress(IEnumerable<TestScenarios>? scenarios)
  {
    var list = (scenarios ?? Enumerable.Empty<TestScenarios>()).ToList();
    var total = list.Count;

    return list
      .GroupBy(s => s.Status.ToString())
      .Select(g => new ProgressItem
      {
        State = g.Key,
        Count = g.Count(),
        Percentage = total == 0 ? 0.0 : Math.Round(g.Count() * 100.0 / total, 2),
        
      })
      .OrderByDescending(p => p.Count)
      .ToList();
  }
}