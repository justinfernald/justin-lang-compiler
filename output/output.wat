(module
    (import "console" "log" (func $output (param i32)))
    (global $x i32)
    (func $minloc
        (param $a i32)
        (param $low i32)
        (param $high i32)
        (result i32)
        (local $i i32)
        (local $x i32)
        (local $k i32)
        (local.set $k
            (local.get $low)
        )
        (local.set $x
            (local.get $a)
        )
        (local.set $i
            (i32.add
                (local.get $low)
                (i32.const 1)
            )
        )
        (local.get $i)
        (local.get $high)
        (local.get $a)
        (local.get $x)
        (local.set $x
            (local.get $a)
        )
        (local.set $k
            (local.get $i)
        )
        (local.set $i
            (i32.add
                (local.get $i)
                (i32.const 1)
            )
        )
        (local.get $k)
    )(export "minloc" (func $minloc))

    (func $sort
        (param $a i32)
        (param $low i32)
        (param $high i32)
        
        (local $i i32)
        (local $k i32)
        (local.set $i
            (local.get $low)
        )
        (local.get $i)
        (i32.add
            (local.get $high)
            (i32.const 1)
        )
        (local $t i32)
        (local.set $k
            (call $minloc
                (local.get $a)
                (local.get $i)
                (local.get $high)
            )
        )
        (local.set $t
            (local.get $a)
        )
        (local.set $a
            (local.get $a)
        )
        (local.set $a
            (local.get $t)
        )
        (local.set $i
            (i32.add
                (local.get $i)
                (i32.const 1)
            )
        )
    )(export "sort" (func $sort))

    (func $main
        
        (local $i i32)
        (local.set $i
            (i32.const 0)
        )
        (local.get $i)
        (i32.const 10)
        (local.set $x
            (call $input
            )
        )
        (local.set $i
            (i32.add
                (local.get $i)
                (i32.const 1)
            )
        )
        (call $sort
            (local.get $x)
            (i32.const 0)
            (i32.const 10)
        )
        (local.set $i
            (i32.const 0)
        )
        (local.get $i)
        (i32.const 10)
        (call $output
            (local.get $x)
        )
        (local.set $i
            (i32.add
                (local.get $i)
                (i32.const 1)
            )
        )
    )(export "main" (func $main))

)
