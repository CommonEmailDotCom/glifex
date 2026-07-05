using System;
using System.Linq;
using System.Collections.Generic;
class Practice : ISolution {
    public object Solve(Dictionary<string, object> c) {
        var s = c["s"].ToString().OrderBy(x => x);
        var t = c["t"].ToString().OrderBy(x => x);
        return s.SequenceEqual(t);
    }
}
