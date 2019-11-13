var BorderPositions = ["center", "inside", "outside"],
    FillTypes = ["color", "gradient"],
    GradientTypes = ["linear", "radial", "angular"],
    ShadowTypes = ["outer", "inner"],
    TextAligns = ["left", "right", "center", "justify", "left"],
    ResizingType = ["stretch", "corner", "resize", "float"];
// 字体色库
var contColorDict = {
    "#ffffff_1.00": "cont_color_a",
    "#272829_1.00": "cont_color_b",
    "#8e9294_1.00": "cont_color_c",
    "#a2a6a8_1.00": "cont_color_d",
    "#b8bcbf_1.00": "cont_color_e",
    "#3d3f40_1.00": "cont_color_f",
    "#cbd1d4_1.00": "cont_color_g",
    "#ff392b_1.00": "cont_color_h",
    "#515354_1.00": "cont_color_j",
    "#00a2ff_1.00": "linktip_color_c",
    };
// 背景色库
var bgLineColorDict = {
    "#d4d4d4_1.00": "bgline_color_a",
    "#edeff0_1.00": "bgline_color_b",
    "#f7f9fa_1.00": "bgline_color_c",
    "#ffffff_1.00": "bgline_color_d",
    "#ffffff_1.00": "bgline_color_e",
    "#ffffff_0.92": "bgline_color_f",
    "#f7f9fa_1.00": "bgline_color_g",
    "#ffffff_1.00": "bgline_color_h",
    "#ffffff_1.00": "bgline_color_i",
    "#f2f4f5_1.00": "bgline_color_j",
    "#ffffff_1.00": "bgline_color_k",
    };
// 强调色库
var otherColorDict = {
    "#ff392b_1.00": "cont_color_h",
    "#00a2ff_1.00": "linktip_color_a",
    "#2bbcff_1.00": "linktip_color_b",
    "#00a2ff_1.00": "linktip_color_c",
    "#ffa32b_1.00": "linktip_color_d",
    "#2470d4_1.00": "linktip_color_e",
    "#a32bff_1.00": "other_color_a",
    "#ff2b87_1.00": "other_color_b",
    "#24d45c_1.00": "other_color_c",
    "#fff82b_1.00": "other_color_e",
    "#ffd82b_1.00": "other_color_f",
    "#fffbeb_0.92": "other_color_g",
    };
// 蒙层色库    
var maskColorDict = {
    "#000000_0.33": "mask_color_b33",
    "#000000_0.42": "mask_color_b42",
    "#000000_0.50": "mask_color_b50",
    "#000000_0.66": "mask_color_b66",
    "#ffffff_0.25": "mask_color_c25",
    "#ffffff_0.50": "mask_color_c50",
    "#ffffff_0.83": "mask_color_c83",
    
    };
// 边框色库    
var borderColorDict = {
    "#000000_0.08": "border_color_a",
    "#ffffff_1.00": "border_color_b",
    };


var bgLineColors = [ "bgline_color_a","bgline_color_b","bgline_color_c","bgline_color_d","bgline_color_e",
"bgline_color_f","bgline_color_g","bgline_color_h","bgline_color_i","bgline_color_j","bgline_color_k",]
var otherColors = [ "cont_color_h", "linktip_color_a","linktip_color_b","linktip_color_c","linktip_color_d","linktip_color_e","other_color_a",
"other_color_b","other_color_c","other_color_e","other_color_f","other_color_g"]
var maskColors  = ["mask_color_b33","mask_color_b42","mask_color_b50","mask_color_b66","mask_color_c25","mask_color_c50","mask_color_c83",]
var colorPools = [ bgLineColors, otherColors,maskColors];
var colorPoolNames = ["背景色库", "强调色库", "蒙层色库"];

var kLayerTBColorCustomKey = "kLayerTBColorCustomKey";
var kLayerTBOrignalNameKey = "kLayerTBOrignalNameKey";

var app = NSApplication.sharedApplication(),
    doc,             // MSDocument object,
    selection,       // an NSArray of the layer(s) that are selected in the current document
    plugin,
    command,
    page,            // the current page in the current document
    artboards,       // artboards and slices on the current page
    selectedArtboard;


//--------------------------------------//
//               Context                //
//--------------------------------------//

/**
 * 初始化插件的运行上下文
 * @param context
 */
function initContext(context) {
    doc = context.document,
    selection = context.selection,
    plugin = context.plugin,
    command = context.command,
    page = doc.currentPage(),
    artboards = page.artboards(),   // 只读
    selectedArtboard = page.currentArtboard(),
    currentLayer = (selection.count() > 0) ? selection[0] : undefined;  // 当前画板默认是用户选择的第一个画板
}

// 读取一个图层的色值
var onRun = function (context) {
    initContext(context);
    var customColorValue = readColorValue(context, currentLayer);
    if (customColorValue) {
        doc.showMessage(customColorValue);
    } else {
        doc.showMessage("当前选中图层的颜色不在色库中" + getColor(currentLayer));
    }
};

// 读取一个图层的色值
function readColorValue (context, layer) {
    // 初始化上下文
    initContext(context);
    if (layer.isKindOfClass(MSLayer) == false || layer.isKindOfClass(MSLayerGroup)) {
        return "不是有效图层";
    }
    saveOrignalLayerName(layer);
    var customColorValue = command.valueForKey_onLayer(kLayerTBColorCustomKey, layer);
    if (customColorValue == null) {
        customColorValue = getColor(layer);
    }
    return customColorValue;
}

// 给所有的图层设置颜色
var setColorValueAllLayers = function (context) {
    // 初始化上下文
    initContext(context);
    for (var i = 0; i < artboards.count(); i++) {
        var artboard = artboards[i];
        for (var j = 0; j < artboard.layers().count(); j++) {
            var layer = artboard.layers()[j];
            var finallayer = getChildren(layer);
            if (finallayer == null) {
                continue;
            }
            var colortext = getColor(finallayer);
            if (colortext) {
                command.setValue_forKey_onLayer(colortext, kLayerTBColorCustomKey, finallayer);
                saveOrignalLayerName(finallayer);
                finallayer.name = colortext + " | " + getOrignalLayerName(finallayer);
            } else {
            }
            
        }
    }
    doc.showMessage("设置成功");
}

var setColorValueWithLayers = function (context) {
    // 初始化上下文
    initContext(context);
    setEachLayerName(currentLayer);
}

var setEachLayerName = function (layer) {
    var finalLayer = getChildren(layer);
    for (var i = 0; i < finalLayer.length; i++) {
        var child = finalLayer[i];
        log(child);
        var colortext = getColor(child);
        if (colortext) {
            saveOrignalLayerName(child);
            child.name = colortext + " | " + getOrignalLayerName(child);
        }
    }
}

// 给当前选中的图层设置颜色
var setColorValueWithOneLayer = function (context, layer) {
    // 初始化上下文
    initContext(context);
    openSetColorPanel(context, layer);
}

// 给当前多选的图层设置颜色
var setColorValueWithSectionLayers = function (context, selection) {
    // 初始化上下文
    initContext(context);
    openSetColorPanelWithLayers(context, selection);
}

var setColorValueWithCurrentLayer = function (context) {
    initContext(context);
    if (!currentLayer) {
        doc.showMessage("当前没有选中任何图层！！");
        return;
    }
    if (selection.count() > 1) {
        doc.showMessage("当前为多选图层状态");
        setColorValueWithSectionLayers(context, selection);
    } else {
        setColorValueWithOneLayer(context, currentLayer);
    }
}

// 指定一个layer的颜色
var setSelectedLayerColorValue = function (context) {
    // 初始化上下文
    initContext(context);
}

var restoreLayer = function (context) {
    // 初始化上下文
    initContext(context);
    restorSelectionLayerName(selection);
}

var restorEachLayerName = function (layer) {
    var finalLayer = getChildren(layer);
    for (var i = 0; i < finalLayer.length; i++) {
        var child = finalLayer[i];
        child.name = getOrignalLayerName(child);
        command.setValue_forKey_onLayer(null,kLayerTBColorCustomKey,child);
    }
}

var restorSelectionLayerName = function (selection) {
    for (var i = 0; i < selection.count(); i++) {
        var layer = selection[i];
        restorEachLayerName(layer);
    }
}
// 解除所有图层的组件
var ungroupAllLayer = function (context) {
    // 初始化上下文
    initContext(context);
    for (var i = 0; i < artboards.count(); i++) {
        var artboard = artboards[i];
        console.log(artboard);
        for (var j = 0; j < artboard.layers().count(); j++) {
            var layer = artboard.layers()[j];
            for (var x = 0; x < layer.children().count(); x++) {
                var child = layer.children()[x];
                console.log(child);
                if (child.isKindOfClass(MSSymbolInstance)) {
                    console.log("ungrounping...");
                    child.symbolMaster().ungroup();
                }
            }
        }
    }
    console.log("解组完成！");
    doc.showMessage("解组完成！");
}

function ungroupWithLayer (context) {
    initContext(context);
    if (currentLayer.isKindOfClass(MSSymbolInstance)) {
        currentLayer.symbolMaster().ungroup();
    }
    console.log("解组完成！");
    doc.showMessage("解组完成！");
}

var getColor = function (layer) {
    var text = '';
    if (layer.class() == 'MSTextLayer') {
      text = exportText(layer);
    } else {
      text = exportSize(layer);
    }
    return text;
}

// 字体layer处理
var exportText = function (layer) {
    var returnText = [];
    var colorArray = colorToKeyForText(layer.textColor());
    if (colorArray.length > 0) {
        returnText.push(colorArray);
        return returnText.join('');
    } else {
        return "该字体颜色不在色库中";
    }
}

var exportSize = function (layer) {
    var layerStyle = layer.style();
    var returnText = [];
    var backgroundColor = getFills(layerStyle);
    var borderColor = getBorders(layerStyle);

    if (backgroundColor.length > 0) {
      if (backgroundColor[0].fillType == 'color') {
        returnText.push("填充颜色");
        returnText.push(backgroundColor[0].color);
      } else if (backgroundColor[0].fillType == 'gradient') {
        returnText.push("填充颜色");
        var bzone6 = function bzone6(z) {
          if (z.length != 6) {
            z = '0' + z;
          }

          if (z.length != 6) {
            bzone6(z);
          } else {
            return z;
          }
        };

        var param = [];
        var to = backgroundColor[0].gradient.to;
        var from = backgroundColor[0].gradient.from;
        param.push(parseInt(90 - 180 * Math.atan(Math.abs(to.y - from.y) / Math.abs(to.x - from.x)) / Math.PI) + 'deg');
        var colorStops = backgroundColor[0].gradient.colorStops;

        for (var i = 0; i < colorStops.length; i++) {
            param.push(colorStops[i].color + ' ' + parseInt(colorStops[i].position * 100) + '%');
        }

        returnText.push('linear-gradient(' + param.join(',') + ')');
      }
    } 
    
    if (borderColor.length > 0) {
      returnText.push("边框颜色");
      returnText.push(borderColor[0].color);
    }

    return returnText.join('');
}

// 获取填充颜色
var getFills = function (style) {
    var fillsData = [],
        fill,
        fillIter = style.fills().objectEnumerator();

    while (fill = fillIter.nextObject()) {
      if (fill.isEnabled()) {
        var fillType = FillTypes[fill.fillType()],
            fillData = {
          fillType: fillType
        };

        switch (fillType) {
          case "color":
            fillData.color = colorToKey(fill.color());
            break;

          case "gradient":
            fillData.gradient = gradientToJSON(fill.gradient());
            break;

          default:
            continue;
        }

        fillsData.push(fillData);
      }
    }

    return fillsData;
}

// 获取border颜色
var getBorders = function (style) {
    var bordersData = [],
        border,
        borderIter = style.borders().objectEnumerator();

    while (border = borderIter.nextObject()) {
      if (border.isEnabled()) {
        var fillType = FillTypes[border.fillType()],
            borderData = {
          fillType: fillType,
          position: BorderPositions[border.position()],
          thickness: border.thickness()
        };

        switch (fillType) {
          case "color":
            borderData.color = colorToKeyForBorder(border.color());
            break;

          case "gradient":
            borderData.gradient = gradientToJSON(border.gradient());
            break;

          default:
            continue;
        }

        bordersData.push(borderData);
      }
    }

    return bordersData;
}

var colorToKey = function (color) {
    var colorHex = colorToJSON(color);
    var colorArray = [];

    var key = colorHex.color + "_" + colorHex.alpha;

    if (bgLineColorDict[key]) {
      colorArray.push(bgLineColorDict[key]);
    }

    if (otherColorDict[key]) {
      colorArray.push(otherColorDict[key]);
    }

    if (maskColorDict[key]) {
      colorArray.push(maskColorDict[key]);
    }

    if (colorArray.length == 0) {
        colorArray.push(key);
    }

    return colorArray;
}

var colorToKeyForText = function (color) {
    var colorHex = colorToJSON(color);
    var colorArray = [];

    var key = colorHex.color + "_" + colorHex.alpha;

    if (contColorDict[key]) {
      colorArray.push(contColorDict[key]);
    }

    if (colorArray.length == 0) {
        colorArray.push(key);
    }
    return colorArray;
}

var colorToKeyForBorder = function (color) {
    var colorHex = colorToJSON(color);
    var colorArray = [];

    var key = colorHex.color + "_" + colorHex.alpha;

    if (borderColorDict[key]) {
        colorArray.push(borderColorDict[key]);
    }

    if (contColorDict[key]) {
        colorArray.push(contColorDict[key]);
    }

    if (otherColorDict[key]) {
        colorArray.push(otherColorDict[key]);
    }

    if (colorArray.length == 0) {
        colorArray.push(key);
    }
    return colorArray;
}

var colorToJSON = function (color) {
    var obj = {
        r: Math.round(color.red() * 255),
        g: Math.round(color.green() * 255),
        b: Math.round(color.blue() * 255),
        a: color.alpha()
      };
  
    function bzone(d) {
    if (d.length == 1) {
        d = '0' + d;
    }

    return d;
    }
    return {
    color : '#' + bzone(obj.r.toString(16)) + bzone(obj.g.toString(16)) + bzone(obj.b.toString(16)),
    alpha : obj.a.toFixed(2)
    }
}

function pointToJSON(point) {
    return {
      x: parseFloat(point.x),
      y: parseFloat(point.y)
    };
}

function colorStopToJSON(colorStop) {
    return {
      color: colorToJSON(colorStop.color()),
      position: colorStop.position()
    };
  }

function gradientToJSON(gradient) {
    var stopsData = [],
        stop,
        stopIter = gradient.stops().objectEnumerator();

    while (stop = stopIter.nextObject()) {
        stopsData.push(colorStopToJSON(stop));
    }

    return {
        type: GradientTypes[gradient.gradientType()],
        from: pointToJSON(gradient.from()),
        to: pointToJSON(gradient.to()),
        colorStops: stopsData
    };
}


function getChildren (layer) {
    if (layer.isKindOfClass(MSShapeGroup)) {
        return layer.children();
    } else if (layer.isKindOfClass(MSSymbolInstance)) {
        return layer.symbolMaster().children();
    } else if (layer.isKindOfClass(MSSymbolMaster)) {
        return layer.children();
    } else if (layer.isKindOfClass(MSArtboardGroup)){
        var layers = layer.layers();
        var childrens = [];
        for (var i = 0; i < layers.count(); i++) {
            var tempChildren = getChildren(layers[i]);
            for (var j = 0; j < tempChildren.count(); j++) {
                var t = tempChildren[j];
                if (t.isKindOfClass(MSSliceLayer)) {
                    continue;
                }
                childrens.push(t);
            }
        }
        return childrens;
    } else {
        return layer.children();
    }
}

function openSetColorPanel(context, layer) {
    var customColorName = readColorValue(context, layer);
    var buttons = [];

    // 创建视图
    var view = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 400, 150)];

    // Label
    var label = [[NSText alloc] initWithFrame:NSMakeRect(0, 0, 400, 30)];
    label.backgroundColor = NSColor.clearColor();
    label.textAligment = NSTextAlignmentRight;
    label.string = [NSString stringWithFormat:@"当前图层的颜色：%@",customColorName];
    [view addSubview:label];

    var frame = NSMakeRect(0, 30, 150, 30);
    for (var pool in colorPools) {
        var button = [[NSPopUpButton alloc] initWithFrame:frame];
        [button addItemWithTitle:colorPoolNames[pool]];

        var colorArray = colorPools[pool];
        for (var index in colorArray) {
            [button addItemWithTitle:colorArray[index]];
        }
        
        [view addSubview:button];
        buttons.push(button);
        frame.origin.y += frame.size.height;

        [button setCOSJSTargetFunction:function(sender) {
            buttonAction(sender);
        }];
    }

    var restoreButton = [[NSButton alloc] initWithFrame:NSMakeRect(220, 30, 125, 30)];
    restoreButton.bezelStyle = NSBezelStyleRounded;
    [restoreButton setTitle:@"一键还原图层颜色"];
    [restoreButton setCOSJSTargetFunction:function(sender) {
        for (const key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                const element = buttons[key];
                [element selectItemAtIndex:0];
            }
        }
        var value = getColor(currentLayer);
        label.string = [NSString stringWithFormat:@"当前图层的颜色：%@",value];
        command.setValue_forKey_onLayer(value, kLayerTBColorCustomKey, currentLayer);
        saveOrignalLayerName(currentLayer);
        currentLayer.name = value + " | " + getOrignalLayerName(currentLayer);
        doc.showMessage(value);
    }];
    [view addSubview:restoreButton];

    function buttonAction(button) {
        for (const key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                const element = buttons[key];
                if (element != button) {
                    [element selectItemAtIndex:0];
                }
            }
        }
        if (button.indexOfSelectedItem() == 0) {
            return;
        }
        label.string = [NSString stringWithFormat:@"当前图层的颜色：%@",button.titleOfSelectedItem()];
        var value = button.titleOfSelectedItem();
        command.setValue_forKey_onLayer(value, kLayerTBColorCustomKey, currentLayer);
        // 将当前的layer的名称替换成颜色名。
        saveOrignalLayerName(currentLayer);
        currentLayer.name = value + " | " + getOrignalLayerName(currentLayer);
        doc.showMessage(value);
    }

    // 显示对话框
    var alertWindow = COSAlertWindow.new();
    alertWindow.addButtonWithTitle("OK");
    alertWindow.addButtonWithTitle("Cancel");
    alertWindow.setMessageText("色库名称修改:");
    alertWindow.setInformativeText("请选择要命名的色值名称");
    alertWindow.setAccessoryView(view); // 不用 addAccessoryView，否则宽度强制被固定为300
    alertWindow.runModal();
}

function openSetColorPanelWithLayers(context, selection) {
    var buttons = [];

    // 创建视图
    var view = [[NSView alloc] initWithFrame:NSMakeRect(0, 0, 400, 150)];

    // Label
    var label = [[NSText alloc] initWithFrame:NSMakeRect(0, 0, 400, 30)];
    label.backgroundColor = NSColor.clearColor();
    label.textAligment = NSTextAlignmentRight;
    label.string = [NSString stringWithFormat:@"当前为多选图层状态"];
    [view addSubview:label];

    var frame = NSMakeRect(0, 30, 150, 30);
    for (var pool in colorPools) {
        var button = [[NSPopUpButton alloc] initWithFrame:frame];
        [button addItemWithTitle:colorPoolNames[pool]];

        var colorArray = colorPools[pool];
        for (var index in colorArray) {
            [button addItemWithTitle:colorArray[index]];
        }
        
        [view addSubview:button];
        buttons.push(button);
        frame.origin.y += frame.size.height;

        [button setCOSJSTargetFunction:function(sender) {
            buttonAction(sender);
        }];
    }

    var restoreButton = [[NSButton alloc] initWithFrame:NSMakeRect(220, 30, 125, 30)];
    restoreButton.bezelStyle = NSBezelStyleRounded;
    [restoreButton setTitle:@"一键还原图层颜色"];
    [restoreButton setCOSJSTargetFunction:function(sender) {
        for (const key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                const element = buttons[key];
                [element selectItemAtIndex:0];
            }
        }

        for (const key in selection) {
            if (selection.hasOwnProperty(key)) {
                const layer = selection[key];
                var value = getColor(layer);
                command.setValue_forKey_onLayer(value, kLayerTBColorCustomKey, layer);
                saveOrignalLayerName(layer);
                layer.name = value + " | " + getOrignalLayerName(layer);
            }
        }
        label.string = [NSString stringWithFormat:@"多选图层已还原本身颜色代号"];
    }];
    [view addSubview:restoreButton];

    function buttonAction(button) {
        for (const key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                const element = buttons[key];
                if (element != button) {
                    [element selectItemAtIndex:0];
                }
            }
        }
        if (button.indexOfSelectedItem() == 0) {
            return;
        }
        label.string = [NSString stringWithFormat:@"当前多选图层的颜色：%@",button.titleOfSelectedItem()];
        var value = button.titleOfSelectedItem();
        for (var i = 0; i < selection.count(); i++) {
            const layer = selection[i];
            command.setValue_forKey_onLayer(value, kLayerTBColorCustomKey, layer);
            // 将当前的layer的名称替换成颜色名。
            saveOrignalLayerName(layer);
            layer.name = value + " | " + getOrignalLayerName(layer);
            doc.showMessage(value);
        }
    }

    // 显示对话框
    var alertWindow = COSAlertWindow.new();
    alertWindow.addButtonWithTitle("OK");
    alertWindow.addButtonWithTitle("Cancel");
    alertWindow.setMessageText("色库名称修改:");
    alertWindow.setInformativeText("请选择要命名的色值名称");
    alertWindow.setAccessoryView(view); // 不用 addAccessoryView，否则宽度强制被固定为300
    alertWindow.runModal();
}

function openAlertWithMessage(message) {
    var alertWindow = COSAlertWindow.new();
    alertWindow.addButtonWithTitle("OK");
    alertWindow.setMessageText("当前图层颜色");
    alertWindow.setInformativeText("请选择要命名的色值名称");
    alertWindow.setAccessoryView(view); // 不用 addAccessoryView，否则宽度强制被固定为300
    alertWindow.runModal();
}

function getOrignalLayerName(layer) {
    var originalName = command.valueForKey_onLayer(kLayerTBOrignalNameKey, layer);
    if (originalName) {
        return originalName;
    } else {
        return layer.name();
    }
}

function saveOrignalLayerName(layer) {
    command.setValue_forKey_onLayer(getOrignalLayerName(layer), kLayerTBOrignalNameKey, layer);
}

initContext(context);
setEachLayerName(currentLayer);
