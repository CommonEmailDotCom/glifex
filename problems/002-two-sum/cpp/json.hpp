// Minimal JSON parser (C++ stdlib has none). Vendored so the repo stays dependency-free.
#pragma once
#include <cmath>
#include <cstring>
#include <cctype>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

struct JValue;
using JPtr = std::shared_ptr<JValue>;
struct JValue {
    enum Type { NUL, BOOL, NUM, STR, ARR, OBJ } type = NUL;
    bool b = false; double num = 0; std::string str;
    std::vector<JPtr> arr; std::map<std::string, JPtr> obj;
    std::string dump() const {
        switch (type) {
            case NUL: return "null";
            case BOOL: return b ? "true" : "false";
            case NUM: { double i; if (std::modf(num, &i) == 0.0) return std::to_string((long long)num); return std::to_string(num); }
            case STR: return "\"" + str + "\"";
            case ARR: { std::string s = "["; for (size_t i = 0; i < arr.size(); i++) { if (i) s += ","; s += arr[i]->dump(); } return s + "]"; }
            case OBJ: { std::string s = "{"; bool f = true; for (auto& [k, v] : obj) { if (!f) s += ","; f = false; s += "\"" + k + "\":" + v->dump(); } return s + "}"; }
        }
        return "null";
    }
};

class Json {
    const std::string& s; size_t i = 0;
    explicit Json(const std::string& src) : s(src) {}
    void ws() { while (i < s.size() && isspace((unsigned char)s[i])) i++; }
    JPtr value() {
        ws(); char c = s[i]; auto v = std::make_shared<JValue>();
        if (c == '{') { v->type = JValue::OBJ; i++; ws();
            if (s[i] == '}') { i++; return v; }
            while (true) { ws(); std::string k = str_(); ws(); i++; v->obj[k] = value(); ws();
                if (s[i] == ',') { i++; continue; } i++; break; } return v; }
        if (c == '[') { v->type = JValue::ARR; i++; ws();
            if (s[i] == ']') { i++; return v; }
            while (true) { v->arr.push_back(value()); ws();
                if (s[i] == ',') { i++; continue; } i++; break; } return v; }
        if (c == '"') { v->type = JValue::STR; v->str = str_(); return v; }
        if (c == 't') { v->type = JValue::BOOL; v->b = true; i += 4; return v; }
        if (c == 'f') { v->type = JValue::BOOL; v->b = false; i += 5; return v; }
        if (c == 'n') { i += 4; return v; }
        v->type = JValue::NUM; size_t st = i;
        while (i < s.size() && (isdigit((unsigned char)s[i]) || strchr("-+.eE", s[i]))) i++;
        v->num = std::stod(s.substr(st, i - st)); return v;
    }
    std::string str_() {
        std::string out; i++;
        while (s[i] != '"') { char c = s[i++];
            if (c == '\\') { char e = s[i++]; out += (e == 'n' ? '\n' : e == 't' ? '\t' : e); }
            else out += c; }
        i++; return out;
    }
public:
    static JPtr parse(const std::string& src) { Json j(src); return j.value(); }
};
