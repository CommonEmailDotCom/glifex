/* Generated harness — do not edit. Reads ../test_cases.json, dispatches on variant. */
#define _POSIX_C_SOURCE 199309L  /* clock_gettime under strict -std=c11 */
#include "solution.h"
#include <time.h>

JVal *practice(JVal *c);
JVal *clean(JVal *c);
JVal *optimized(JVal *c);

static char *read_file(const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) { fprintf(stderr, "cannot open %s\n", path); exit(2); }
    fseek(f, 0, SEEK_END); long n = ftell(f); rewind(f);
    char *buf = malloc(n + 1);
    if (fread(buf, 1, n, f) != (size_t)n) { fprintf(stderr, "read error\n"); exit(2); }
    buf[n] = 0; fclose(f); return buf;
}

int main(int argc, char **argv) {
    const char *variant = argc > 1 ? argv[1] : "practice";
    int bench = argc > 2 && !strcmp(argv[2], "--bench");
    JVal *cases = json_parse(read_file("../test_cases.json"));
    JVal *(*fn)(JVal *) = !strcmp(variant, "practice") ? practice
                        : !strcmp(variant, "clean") ? clean : optimized;
    if (bench) {
        double best = 1e18;
        for (int r = 0; r < 5; r++) {
            struct timespec t0, t1;
            clock_gettime(CLOCK_MONOTONIC, &t0);
            for (int i = 0; i < cases->n; i++) fn(jget(cases->items[i], "input"));
            clock_gettime(CLOCK_MONOTONIC, &t1);
            double per = ((t1.tv_sec - t0.tv_sec) * 1e9 + (t1.tv_nsec - t0.tv_nsec)) / (cases->n > 0 ? cases->n : 1);
            if (per < best) best = per;
        }
        printf("  %s: ~%lld ns/case (coarse)\n", variant, (long long)best);
        return 0;
    }
    int passed = 0;
    for (int i = 0; i < cases->n; i++) {
        char *got = jdumps(fn(jget(cases->items[i], "input")));
        char *exp = jdumps(jget(cases->items[i], "expected"));
        int ok = !strcmp(got, exp);
        passed += ok;
        printf("  [%s] case %d", ok ? "PASS" : "FAIL", i);
        if (!ok) printf("  expected=%s got=%s", exp, got);
        printf("\n");
    }
    printf("%d/%d passed\n", passed, cases->n);
    return passed == cases->n ? 0 : 1;
}
