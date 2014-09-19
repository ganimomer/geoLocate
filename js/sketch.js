
var myCanvas;

var transformedData = [];
var sessionsWithoutLoc = []

var CANVAS_WIDTH = 720, CANVAS_HEIGHT = 360, CANVAS_PADDING = 10;

var minX=CANVAS_WIDTH, minY = CANVAS_HEIGHT, maxX = 0, maxY = 0;

var YELLOW = [255,255,0], RED = [255,0,0];


function setup() {
    myCanvas = createCanvas(CANVAS_WIDTH + (3*CANVAS_PADDING),CANVAS_HEIGHT + (6*CANVAS_PADDING));
    myCanvas.parent('display');
    
    loadJSON("data/data.json",function(data){
        for(var i=0;i<data.length;i++)
        {
            var tPropObj = new TransactionProps(data[i].iplongitude,
                                                data[i].iplatitude,
                                                data[i].datetime,
                                                data[i].malwaredetected);
            addSortedByDate(tPropObj,transformedData);
            UpdateMinMaxCoordinatesByObject(tPropObj);
        }
        drawAxes();
        drawTransactions(transformedData);
        drawLegend();
    });
}

function TransactionProps(iplongitude,iplatitude,dateString,malware)
{
    this.posX = (iplongitude * 2) + (CANVAS_WIDTH/2);
    this.posY = (-iplatitude * 2) + (CANVAS_HEIGHT/2);
    this.dateInMil = getDateInMil(dateString);
    this.malwareDetected = malware;
}


function getDateInMil(dateString)
{
    var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var date = new Date();
    date.setFullYear(parseInt(dateString.substr(20,4)));
    date.setMonth(MONTHS.indexOf(dateString.substr(4,3)));
    date.setDate(parseInt(dateString.substr(8,2)));
    date.setHours(parseInt(dateString.substr(11,2)));
    date.setMinutes(parseInt(dateString.substr(14,2)));
    date.setSeconds(parseInt(dateString.substr(17,2)));
    return date.getTime();
}

function addSortedByDate(trans,array)
{
    var i=0;
    for(; i < trans.length ; i++)
    {
        if(trans.dateInMil <= array[i].dateInMil)
        {
            break;
        }
    }
    array.splice(i,0,trans);
}

function UpdateMinMaxCoordinatesByObject(obj)
{
    if (obj.posX < minX)
        minX = obj.posX;
    if (obj.posX > maxX)
        maxX = obj.posX;
    if(obj.posY < minY)
        minY = obj.posY;
    if(obj.posY > maxY)
        maxY = obj.posY;
}

function drawAxes()
{
    stroke(YELLOW)
    //Draw vertical axis
    line(CANVAS_PADDING + (CANVAS_WIDTH/2),CANVAS_PADDING + CANVAS_HEIGHT,CANVAS_PADDING + (CANVAS_WIDTH/2),CANVAS_PADDING);
    
    //Draw horizontal axis
    line(CANVAS_PADDING,CANVAS_PADDING + CANVAS_HEIGHT/2,CANVAS_PADDING + CANVAS_WIDTH,CANVAS_PADDING + (CANVAS_HEIGHT/2));
}

function drawTransactions(drawData)
{
    var minTime = drawData[0].dateInMil;
    var maxTime = drawData[drawData.length-1].dateInMil;
    strokeWeight(2);
    for(var j=0;j<drawData.length;j++)
    {
        updateFillAndStroke(drawData[j],minTime,maxTime);

        var relX = scaleByMinMax(drawData[j].posX,minX,maxX,0,CANVAS_WIDTH),
            relY = scaleByMinMax(drawData[j].posY,minY,maxY,0, CANVAS_HEIGHT);
        ellipse(CANVAS_PADDING + relX, CANVAS_PADDING+ relY,15,15);
    }
}

function updateFillAndStroke(obj,min,max)
{
    stroke(0,
       255,
       scaleByMinMax(obj.dateInMil,min,max,0,255));
    if (obj.malwareDetected)
    {
        fill(RED[0],RED[1],RED[2],50);
    }
    else
    {
        noFill();
    }
}

function scaleByMinMax(pos,min,max,absMin,absMax)
{
    return (pos - min) * (absMax-absMin)/(max-min);
}

function drawLegend()
{
    var START_X = (CANVAS_PADDING*2) + (CANVAS_WIDTH-256);
    var START_Y = CANVAS_PADDING + CANVAS_HEIGHT;
    var END_X = START_X + 256;
    var END_Y = START_Y + CANVAS_PADDING;
    strokeWeight(1);
    stroke(0,0,0);
    noFill();
    rect(START_X-1,START_Y-1,256+1,CANVAS_PADDING+1);
    fill(0,0,0);
    textSize(15);
    text("Earlier",START_X,END_Y + 17);
    text("Later",END_X-35,END_Y + 17);
    stroke(RED);
    fill(RED);
    textSize(12);
    text("Malware Detected",START_X, END_Y + 30);
    for(var i=0;i<256;i++)
    {
        stroke(0,255,i);
        line(START_X + i,START_Y,START_X+i,END_Y);
    }
}