class Create {
    constructor(data) {
        this.data = data
    }
    // set ratio for sapcing and font size
    static onGetRatio(val, width, height){
        if (width) {
            return val / width;
        } else {
            return val / height;
        } 
    }
    static Image(x, y, id, classes, href, width, height) {
        const image = document.createElementNS(_svgNS, 'image');
              image.setAttribute('x', x);
              image.setAttribute('y',y);
              if (id != null) image.setAttribute('id', id);
              if (classes != null) image.setAttribute('class', classes);
              image.setAttribute('href', href);
              if (width != null) image.setAttribute('width', width);
              if (height != null) image.setAttribute('height', height);
        return image;
      }
    static Circle(cx, cy, id, classes, r, color, fillOpacity, stroke, strokeWidth, strokeOpacity) {
        const circle = document.createElementNS(_svgNS, 'circle');
              circle.setAttribute('cx', cx)
              circle.setAttribute('cy', cy);
              if (id != null) circle.setAttribute('id', id);
              if (classes != null) circle.setAttribute('class', classes);
              circle.setAttribute('r', r);
              circle.setAttribute('fill', color);
              circle.setAttribute('fill-opacity', fillOpacity);
              if (stroke != null) circle.setAttribute('stroke', stroke);
              if (strokeWidth != null) circle.setAttribute('stroke-width', strokeWidth);
              if (strokeOpacity != null) circle.setAttribute('stroke-opacity', strokeOpacity);
        return circle;
      }
    static Line(x1, x2, y1, y2, id, classes, stroke, strokeWidth, strokeOpacity) {
        const line = document.createElementNS(_svgNS, 'line');
              line.setAttribute('x1', x1);
              line.setAttribute('x2', x2);
              line.setAttribute('y1', y1);
              line.setAttribute('y2', y2);
              if (id != null) line.setAttribute('id', id);
              if (classes != null) line.setAttribute('class', classes);
              line.setAttribute("stroke",stroke);
              line.setAttribute('stroke-width', strokeWidth);
              line.setAttribute('stroke-opacity', strokeOpacity);
        return line
      }
    static Rect(x, y, id, classes, width, height, color) {
        const rect = document.createElementNS(_svgNS, 'rect');
              rect.setAttribute('x', x);
              rect.setAttribute('y', y);
              if (id != null) rect.setAttribute('id', id);
              if (classes != null) rect.setAttribute('class', classes);
              rect.setAttribute('width', width);
              rect.setAttribute('height', height);
              rect.setAttribute('fill', color);
        return rect;
      }
    static Text(x, y, id, classes, textAnchor, dominantBaseline, color, textContent) {
        const text = document.createElementNS(_svgNS, 'text');
              text.setAttribute('x', x);
              text.setAttribute('y', y);
              if (id != null) text.setAttribute('id', id);
              if (classes != null) text.setAttribute('class', classes);
              if (textAnchor != null) text.setAttribute('text-anchor', textAnchor);
              if (dominantBaseline != null) text.setAttribute('dominant-baseline', dominantBaseline)
              if (color != null) text.setAttribute('fill', color);
              if (textContent != null) text.textContent = textContent;
        return text
      }
    static Tspan(x, dy, id, classes, textAnchor, color, textContent) {
        const tspan = document.createElementNS(_svgNS, 'tspan');
              tspan.setAttribute('x', x);
              tspan.setAttribute('dy', dy);
              if (id != null) tspan.setAttribute('id', id);
              if (classes != null) tspan.setAttribute('class', classes);
              if (textAnchor != null) tspan.setAttribute('text-anchor', textAnchor);
              tspan.setAttribute('fill', color);
              tspan.textContent = textContent;
        return tspan;
      }
    static StackedText(x, y, context, textAnchor, classes, textColor, i) {
        const bodyTGroup = document.createElementNS(_svgNS, 'g');
              bodyTGroup.setAttribute('class', 'title-context');
        if (typeof context != 'string') {
          for (var m = 0; m < context.length; m++) {
            if (typeof i == 'object' && context[m] != '') {  // ('detail-infos') - Title
            if (m == 1) y = y + (m * _chart2.big_gap)
            else if (m == 3) y = y - 3
            else  y = y + (m * _chart2.smst_gap * 1.2)
            const textClas = m == 0 || m == 1 ? "bigger-body" : "small-body"
            const textCol = m == 0 || m == 1 ? "white" : _color.greyText
            const bodyTitle = _createText(x, y, id = null, textClas, textAnchor, dominantBaseline = null, textCol, context[m])
                  bodyTGroup.appendChild(bodyTitle)
            } else if (i == 1 && m == 1 || i == 2 && m == 1 || i == 3 && m == 1) { // ('detail-infos') - Big thin Number
              const newx = i == 2 ? (_margin.gap * 0.6) : x
              const bodyTitle = _createText(newx, y + (_chart2.big_gap * 2), id = null, "thin-biggest-body", textAnchor, dominantBaseline = null, "white", context[m])
                    bodyTGroup.appendChild(bodyTitle)
            } else if (typeof i == 'undefined') { // ('sneakersMap) -Title
              y = m == 1 ? y + (m * _chart2.big_gap) : y + (m * _chart2.smst_gap * 1.104)
              const bodyBody = _createText(x, y, id = null, classes, textAnchor, dominantBaseline = null, textColor, context[m])
                    bodyTGroup.appendChild(bodyBody)
            } else {
              // console.log(i, m, context[m])
              const newGap = m == 3 || m == 5 ? m * _margin.top * 1.1 : m * _margin.top * 1.05  
              const bodyBody = _createText(x, y + newGap, id = null, "small-body", textAnchor, dominantBaseline = null, textColor, context[m])
                  bodyTGroup.appendChild(bodyBody)
            }
          }
        } else {
          const bodyBody = _createText(x, y + (_margin.top * 0.93), id = null, "small-body", textAnchor, dominantBaseline = null, textColor, context)
                bodyTGroup.appendChild(bodyBody)
        }
        return bodyTGroup
      }
}

module.exports.Create = Create;