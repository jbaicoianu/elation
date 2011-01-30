<?php
class Analytics {
    private static $instance;
      public static function singleton() { $name = __CLASS__; if (!self::$instance) { self::$instance = new $name(); } return self::$instance;  }
}

