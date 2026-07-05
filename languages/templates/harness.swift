// Generated harness — do not edit. Reads ../test_cases.json (JSONSerialization is
// in Foundation, so no vendored parser needed), dispatches on variant.
import Foundation

func dump(_ v: Any) -> String {
    if let b = v as? Bool { return b ? "true" : "false" }
    if let a = v as? [Any] { return "[" + a.map(dump).joined(separator: ",") + "]" }
    if let n = v as? NSNumber { return "\(n)" }
    return "\"\(v)\""
}

let args = CommandLine.arguments
let variant = args.count > 1 ? args[1] : "practice"
let data = FileManager.default.contents(atPath: "../test_cases.json")!
let cases = try! JSONSerialization.jsonObject(with: data) as! [[String: Any]]
var passed = 0
for (i, c) in cases.enumerated() {
    let input = c["input"] as! [String: Any]
    let got: Any = variant == "practice" ? practice(input) : variant == "clean" ? clean(input) : optimized(input)
    let ok = dump(got) == dump(c["expected"]!)
    if ok { passed += 1; print("  [PASS] case \(i)") }
    else { print("  [FAIL] case \(i)  expected=\(dump(c["expected"]!)) got=\(dump(got))") }
}
print("\(passed)/\(cases.count) passed")
exit(passed == cases.count ? 0 : 1)
