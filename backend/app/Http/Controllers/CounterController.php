<?php

namespace App\Http\Controllers;

use App\Models\Counter;

class CounterController extends Controller
{
    private function getCounter()
    {
        return Counter::first();
    }

    public function index()
    {
        return response()->json($this->getCounter());
    }

    public function increment()
    {
        $counter = $this->getCounter();
        $counter->count++;
        $counter->save();

        return response()->json($counter);
    }

    public function decrement()
    {
        $counter = $this->getCounter();
        $counter->count--;
        $counter->save();

        return response()->json($counter);
    }

    public function decrementBig()
    {
        $counter = $this->getCounter();
        $counter->count -= 5;
        $counter->save();

        return response()->json($counter);
    }
}
