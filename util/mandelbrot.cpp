#include <iostream>
#include <string>
#include <cstdlib>
#include <gd.h>
#include <gdfonts.h>
#include <gdfontt.h>
#include <arpa/inet.h>
#include <math.h>

class Frame {
 public:
  double minx, miny, maxx, maxy;

  Frame(double tminx, double tminy, double tmaxx, double tmaxy) {
    this->set(tminx, tminy, tmaxx, tmaxy);
  }
  void set(double tminx, double tminy, double tmaxx, double tmaxy) {
    this->minx = tminx;
    this->miny = tminy;
    this->maxx = tmaxx;
    this->maxy = tmaxy;
  }

  void zoom(int level, int row, int column, int tilesize) {
    int width = pow(2, level);
    int height = pow(2, level);
    int columns = ceil(width / tilesize);
    int rows = ceil(height / tilesize);
    //int tilesize = array(min($options["tilesize"], $ret["width"]), min($options["tilesize"], $ret["height"]));

    double scaledsizex = (this->maxx - this->minx) / columns;
    double scaledsizey = (this->maxy - this->miny) / rows;
    double minx = (scaledsizex * column) + this->minx;
    double miny = (scaledsizey * row) + this->miny;
    std::cout << "zoom: " << row << ", " << column << "; " << minx << ", " << miny <<  std::endl;
    this->set(minx, miny, minx + scaledsizex, miny + scaledsizey);
  }
};

class Mandelbrot {
 public:
  static const int maxcolors = 65535;
  //int colors[this->maxcolors];
  Frame *frame;

  Mandelbrot(double minx, double miny, double maxx, double maxy) {
    this->frame = new Frame(minx, miny, maxx, maxy);
  }
  ~Mandelbrot() {
    if (this->frame != NULL)
      delete this->frame;
  }

  void generate(std::string fname, int sizex, int sizey, double minx, double miny, double maxx, double maxy, int iterations, bool truecolor=false) {
    gdImagePtr img;
    int *colors = NULL;
    if (truecolor) {
      img = gdImageCreateTrueColor(sizex, sizey);
    } else {
      img = gdImageCreate(sizex, sizey);
      std::cout << "Load palette: " << std::flush;
      FILE *in;
      if ((in = fopen("palette.png", "r")) != false) {
        colors = new int[iterations+3];
        gdImagePtr palette = gdImageCreateFromPng(in);
        for (int i = 0; i < gdImageSX(palette) && i < iterations; i++) {
          int rgb = gdImageGetPixel(palette, i, 0);
          colors[i] = gdImageColorAllocate(img, (rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
        }
        colors[iterations+1] = gdImageColorAllocate(img, 0, 0, 0);
        colors[iterations+2] = gdImageColorAllocate(img, 255, 255, 255);
        fclose(in);
        std::cout << "done" << std::endl;
      } else {
        std::cout << "FAILED!" << std::endl;
        return;
      }
    }

    std::cout << "Start loop: " << std::flush;
    for (int i = 0; i < sizex; i++) {
      for (int j = 0; j < sizey; j++) {
        double x = this->frame->minx + i * ((this->frame->maxx - this->frame->minx) / (sizex - 1));
        double y = this->frame->miny + j * ((this->frame->maxy - this->frame->miny) / (sizey - 1));
        
        int iteration = 0;
        double z0 = 0, z1 = 0, x2 = 0, y2 = 0;

        while (iteration <= iterations && x2 + y2 <= 4) {
          z1 = (2 * z0 * z1) + y;
          z0 = x2 - y2 + x;

          x2 = z0 * z0;
          y2 = z1 * z1;
          iteration++;
        }

        int colorindex;
        if (truecolor) {
          //colorindex = (iteration == iterations + 1 ? 0 : (int) ((iteration / iterations) * this->maxcolors));
          colorindex = (iteration == iterations + 1 ? 0 : htons(iteration));
          /*
            if (this->colors[colorindex] == 0)
            this->colors[colorindex] = this->colorize(colorindex);
          */
        } else {
          colorindex = colors[iteration];
        }
        gdImageSetPixel(img, i, j, colorindex);
      }
    }
    /*
    char str[128];
    sprintf(str, "(%.5f, %.5f) (%.5f, %.5f)", this->frame->minx, this->frame->miny, this->frame->maxx, this->frame->maxy);
    gdImageString(img, gdFontGetTiny(), 10, 10, (unsigned char *)str, colors[iterations+2]);
    gdImageLine(img, 0, 0, 0, sizey-1, colors[iterations+2]);
    gdImageLine(img, 0, 0, sizex-1, 0, colors[iterations+2]);
    gdImageLine(img, sizex-1, 0, sizex-1, sizey-1, colors[iterations+2]);
    gdImageLine(img, 0, sizey-1, sizex-1, sizey-1, colors[iterations+2]);
    */
    std::cout << "done" << std::endl;
    std::cout << "Write file: " << std::flush;
    FILE *out;
    if ((out = fopen(fname.c_str(), "w")) != false) {
      gdImagePng(img, out); 
      fclose(out);
      std::cout << "done" << std::endl;
    } else {
      std::cout << "FAILED!" << std::endl;
    }
    std::cout << "Cleanup: " << std::flush;
    gdImageDestroy(img);
    //delete[] colors;
    std::cout << "done" << std::endl;
  }
  /*
  void setFrame(double frameminx, double frameminy, double framemaxx, double framemaxy, int zoom=0, int row=0, int col=0) {
    double scaledsizex = (framemaxx - frameminx) / columns;
    double scaledsizey = (framemaxy - frameminy) / rows;
    this->frame->set((scaledsizex * column) + frameminx,
                     (scaledsizey * row) + frameminy,
                     minx + scaledsizex,
                     miny + scaledsizey);
  }
  */
};

int main(int argc, char **argv) {
  if (argc != 9 && argc != 12) {
    std::cout << "Usage: " << argv[0] << " <FILENAME> <WIDTH> <HEIGHT> <MINX> <MINY> <MAXX> <MAXY> <ITERATIONS> [ZOOM] [ROW] [COLUMN]" << std::endl;
  } else {
    std::string fname;
    int width, height, iterations;
    double minx, miny, maxx, maxy;
    unsigned int zoom, row, col;

    fname = argv[1];
    width = atoi(argv[2]);
    height = atoi(argv[3]);
    minx = atof(argv[4]);
    miny = atof(argv[5]);
    maxx = atof(argv[6]);
    maxy = atof(argv[7]);
    iterations = atoi(argv[8]);
    Mandelbrot mb(minx, miny, maxx, maxy);
    if (argc == 12) {
      zoom = atoi(argv[9]);
      row = atoi(argv[10]);
      col = atoi(argv[11]);
      mb.frame->zoom(zoom, row, col, width);
    } else {
      zoom = row = col = 0;
    }

    std::cout << "Generating: " << fname << " " << width << " " << height << " " << minx << " " << miny << " " << maxx << " " << maxy << " " << iterations << std::endl;
    //mb.generate("foo.png", 256, 256, -1.5, -1, 0.5, 1, 200);
    mb.generate(fname, width, height, minx, miny, maxx, maxy, iterations);
  }
}  
  /*
  function generate_mandelbrot($fname, $size, $min, $max, $iterations) {
    $img = ImageCreate($size[0], $size[1]);

    $colors = array(); 
    $colors['inside'] = imagecolorallocate($img, 0, 0, 0); 
    
    Profiler::startTimer("palette");
    $palette = imagecreatefrompng("palette.png"); 
    for ($i=0; $i < imagesx($palette); $i++) { 
      $rgb = imagecolorat($palette, $i, 0); 
      $colors[$i] = imagecolorallocate($img, ($rgb >> 16) & 0xFF, ($rgb >> 8) & 0xFF, $rgb & 0xFF); 
    } 
    Profiler::stopTimer("palette");


    Profiler::startTimer("mainloop");
    for ($i = 0; $i < $size[0]; $i++) {
      for ($j = 0; $j < $size[1]; $j++) {
        Profiler::startTimer("math");
        $x = $min[0] + $i * (($max[0] - $min[0]) / ($size[0] - 1));
        $y = $min[1] + $j * (($max[1] - $min[1]) / ($size[1] - 1));
        
        $iteration = 0;
        $z0 = 0;
        $z1 = 0;
        $x2 = $y2 = 0;

        while ($iteration <= $iterations && $x2 + $y2 <= 4) {
          $z1 = (2 * $z0 * $z1) + $y;
          $z0 = $x2 - $y2 + $x;

          $x2 = $z0 * $z0;
          $y2 = $z1 * $z1;
          $iteration++;
        }
        Profiler::stopTimer("math");

        Profiler::startTimer("setpixel");
        $color = $colors[($iteration == $iterations ? 'inside' : $iteration)];
        ImageSetPixel($img, $i, $j, $color);
        Profiler::stopTimer("setpixel");
      }
    }
    Profiler::stopTimer("mainloop");
    Profiler::startTimer("saveimage");
    ImagePNG($img, $fname); 
    Profiler::stopTimer("saveimage");

    //print Profiler::display();
  }
  */
