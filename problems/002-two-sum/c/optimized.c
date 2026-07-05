#include "solution.h"

/* O(n) with a tiny open-addressing hash map on the stack. */
JVal *optimized(JVal *c) {
    JVal *nums = jget(c, "nums");
    double target = jget(c, "target")->num;
    enum { CAP = 1024 };
    double keys[CAP]; int idxs[CAP], used[CAP];
    memset(used, 0, sizeof(used));
    for (int i = 0; i < nums->n; i++) {
        double need = target - nums->items[i]->num;
        unsigned h = (unsigned)((long long)need * 2654435761u) % CAP;
        while (used[h]) {
            if (keys[h] == need) {
                JVal *r = jarr_(2); jpush_(r, jnum_(idxs[h])); jpush_(r, jnum_(i)); return r;
            }
            h = (h + 1) % CAP;
        }
        double k = nums->items[i]->num;
        unsigned h2 = (unsigned)((long long)k * 2654435761u) % CAP;
        while (used[h2] && keys[h2] != k) h2 = (h2 + 1) % CAP;
        keys[h2] = k; idxs[h2] = i; used[h2] = 1;
    }
    return jarr_(0);
}
