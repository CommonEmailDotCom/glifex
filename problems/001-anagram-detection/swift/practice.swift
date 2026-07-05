import Foundation

func practice(_ c: [String: Any]) -> Any {
    return (c["s"] as! String).sorted() == (c["t"] as! String).sorted()
}
