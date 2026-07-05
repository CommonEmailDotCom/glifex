;; two-sum in WebAssembly Text. Contract (host marshals JSON):
;;   solve(ptr: i32, len: i32, target: f64) -> i64   ;; (i << 32) | j, or -1
(module
  (memory (export "memory") 1)
  (func (export "solve") (param $ptr i32) (param $len i32) (param $target f64) (result i64)
    (local $i i32) (local $j i32) (local $a i32) (local $b i32)
    (block $done
      (loop $outer
        (br_if $done (i32.ge_s (local.get $i) (local.get $len)))
        (local.set $a (i32.load (i32.add (local.get $ptr) (i32.shl (local.get $i) (i32.const 2)))))
        (local.set $j (i32.add (local.get $i) (i32.const 1)))
        (loop $inner
          (if (i32.lt_s (local.get $j) (local.get $len))
            (then
              (local.set $b (i32.load (i32.add (local.get $ptr) (i32.shl (local.get $j) (i32.const 2)))))
              (if (f64.eq (f64.add (f64.convert_i32_s (local.get $a)) (f64.convert_i32_s (local.get $b))) (local.get $target))
                (then
                  (return (i64.or
                    (i64.shl (i64.extend_i32_u (local.get $i)) (i64.const 32))
                    (i64.extend_i32_u (local.get $j))))))
              (local.set $j (i32.add (local.get $j) (i32.const 1)))
              (br $inner))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $outer)))
    (i64.const -1)))
