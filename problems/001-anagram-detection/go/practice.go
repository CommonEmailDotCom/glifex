package main

import "sort"

func sortStr(s string) string {
	r := []rune(s)
	sort.Slice(r, func(i, j int) bool { return r[i] < r[j] })
	return string(r)
}

func practice(c map[string]any) any {
	return sortStr(c["s"].(string)) == sortStr(c["t"].(string))
}
