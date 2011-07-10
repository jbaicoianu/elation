#!/usr/bin/python

# cssmin.py - A simple CSS minifier
# Usage: cat filename.js |./cssmin.py >filename.min.js
#
# Based on cssmin.php by Joe Scylla <joe.scylla@gmail.com>
# Loosely modeled after jsmin.py by Baruch Even
# Which was a port of Douglas Crockford's original jsmin.c
# Munged together by James Baicoianu <james@thefind.com> 
# While under the employment of TheFind.com
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# The Software shall be used for Good, not Evil.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import re

class CSSMinify:
  def _cssmin(self):
    css = ""
    while True:
      buf = self.instream.readline()    
      if not buf:
        break;
      css += buf

    search = ['\/\*[\d\D]*?\*\/|\t+', '\s+', '\}\s+', '\\;\s', '\s+\{\\s+', '\\:\s+\\#', ',\s+', '\\:\s+\\\'', '\\:\s+([0-9]+|[A-F]+)', '\\n']
    replace = ['', ' ', '}\n', ';', '{', ':#', ',', ':\'', ':\\1', '']
    for i in range(len(search)):
      r = re.compile(search[i], re.I| re.M | re.S)
      css = r.sub(replace[i], css);

    print css
  
  def minify(self, instream, outstream):
    self.instream = instream
    self.outstream = outstream

    self._cssmin()
    self.instream.close()

if __name__ == '__main__':
    import sys
    cssmin = CSSMinify()
    cssmin.minify(sys.stdin, sys.stdout)

