Hi I am planning to develop a virtual lab in projections of solids, kindly go through the below instructions and step by step procedure. 

Get me a .html, .css and .js files (three separate files) to animate the step by step procedure of a virtual lab. As I want to test the code/logic while i am progressing to develop the lab, first get me the complete .html, .css and .js codes separately. Once we finalise the .html, .css (layout) thereafter we will proceed only with generation of code based on the logic progressively.
Ensure that the layout confirms with latest UI/UX aesthetic and modern look. The left side of the screen shall be dedicated to the user input (17% width), right side is dedicated for canvas area to demonstrate the animation/step by step procedure. Add controls such as pan, zoom in/out, next step, previous step controls at the top of canvas, also just above the drawing area provide the stepwise instructions/concepts/exxplanations (10% height) ensure that we use maximum area of the screen without any wastage. I want efficient usage of the whole screen area. Also provide selection of solid in a single dropdown list (triangular prism, square prism, pentagonal prism, hexagonal prism, triangular Pyramid, square Pyramid, pentagonal Pyramid, hexagonal Pyramid, Cone and Cylinder) so that we can preserve some space. (I want to maximise the efficient usage of space.)

CASE selection in a single dropdown, and based on case selection the other data can be asked from the user to fill such as edge angle and axis inclination with HP (CASE - A), Axis inclination with VP, and resting on rectangular surface/longer edge and if it is resting on longer edge then we one more data such as lateral face containing the resting making angle with HP  (prisms), and resting on base edge/base corner and if pyramid is resting on base corner, then the angle made by the edge containing resting corner with HP (pyramids)and axis inclination with HP and resting on bsae edge/resting on base corner, resting on triangular surfaces (CASE C), and axis angle with VP in addition to the data required in case B (case D).
The purpose of this step by step procedure, virtual lab, is to teach students how to draw projections of solid in drawing sheet. Use first angle (top view below xy line, front view above xy line), also initial top view/front view and subsequent stages of front view and top view are all drawn in the same, common xy line (just similar to the engineering drawing of projections of solids in A3 sheet by an engg  graduate)

Projections of solids basics
Projections of solids involve following cases, types of solids, solids defined by, terminologies, type of projections:
There are totally four cases
Case A: solids with axis perpendicular to HP
Case B: solids with axis perpendicular to VP
Case C:  solids with axis inclined to HP
Case D: solids with axis inclined to VP
Types of solids: prisms, pyramids, cone, cylinder
Prisms: triangular prism, square prism, pentagonal prism, hexagonal prism
Pyramids: triangular Pyramid, square Pyramid, pentagonal Pyramid, hexagonal Pyramid
Cone and Cylinder
TRUE SHAPE: true shape is the shape of the solid in its initial view which is always indicated by the name of the solid. For example in the case of hexagonal prism, the true shape is a hexagon of side length equal to the base edge length, and for a square pyramid the true shape is the square of side length equal to the base edge of the pyramid and so on.
solids are always defined by their axis length (distance of imaginary line from base centre, to top surface centre), and base side length.
Terminologies in solids: solids contain corners, edges, and surfaces each are described below in detail.

Corners: 
prism has n-base corners, n-top corners totally 2n corners, base corners named in numbers 1,2,3 etc, and top corners named in alphabets a,b,c etc (eg. a pentagonal prism has a total of 10 corners, 5 base and 5 top corners). Pyramid has n+1 corners (n - base corners named in numbers, one apex/top corner named as o). Eg. A hexagonal pyramid has 7 corners, 6 basse corners and 1 apex.
Edges: 
prisms has 2n base edges, n vertical edges (base edges are obtained by joining two base corners in succession for eg. ab, bc and so on, finally n th corner is joined with the first corner. for example in case of triangular prism the three base edges are ab, bc, ca and in case of hexagonal prism ab, bc, cd, de, ef, fa, and vertical edges are obtained by each base edge with corresponding top edge i.e top corner ‘a’ is joined with base corner ‘1’, top corner ‘b’ joined with base corner ‘2’ etc and a n sided prism will have n vertical edges such as 1a, 2b, 3c etc till nth corner.
Pyramids are those with n +n edges,  n base edges similar to prism (but pyramids have only one base surface and other end is a single point apex corner, and n slant edges/inclined edges/lateral edges which is obtained by joining each of the base corner with apex (i.e 1o, 2o, 3o etc)
Surfaces:
In case of prisms they have n+2 surfaces - 2 base surfaces with the shape of polygon by which the prism is identified the surface name is the polygon name (eg. in case of square prism it has two end surfaces/bases named as 1234 (bottom surface) and abcd (top surface), then prisms also have lateral surfaces/rectangular side surfaces bound by four corners-base two corners joined with top two corners - eg ab21, bc32, cd43 etc)
In case of pyramids it contains n+1 surfaces n triangular surfaces /lateral surfaces / slant surfaces obtained by joining two base corners with apex, and next two base corners with apex and so on (for example in case of pentagonal pyramid the lateral surfaces are 12o, 23o, 34o, 45o and 51o)


Initial position drawing logic: for any given problem of any CASE (CASE A, B, C, or D) always the very first drawing is drawing the true shape of the given solid type (i.e for triangular prism - true shape is a triangle of side length equal to the base side of the prism, like wise for pentagonal pyramid true shape is the pentagon of side length equal to the base edge lengths per given ata, and similarly for all solids).


When a solid is defined in the question, then based on the solid we need to save the number of corners in the memory and each time the view of any solid is completed by joining the corners as per the definition of the solid.Always remember to join the corners using below logic:
Joining corners, drawing logic: 
Use this corner joining logic for completing the projections of solids in any view each time.(VERY IMPORTANT and MUST BE USED in DRAWING ANY VIEW). These logics must be used for all types of orientation, for all views in any stage of the drawing.
If the given solid is a prism (PRISM corner joining logic): If the solid is a prism then we have 2n corners n-top corners, n-bottom corners. 
RULES:
The top corners (those corners which are farther away from xy line and above xy line in front view) of the solid are ALWAYS named with alphabets and bottom corners of the solid with numerals (those corners that are closer to xy line in front view).
The top view is marked in small letters, the front view is marked with small letters with a prime (like a’, b’ 1’, 2’ etc). Whenever we obtain and mark the corners of a solid, then joining the corners and drawing edges is based on below logic.Always (USE THIS LOGIC ALL THE TIME, IN EVERY VIEW) remember to draw the solid by joining respective corners. Corners joining logic is detailed below.
The lettering in first stage (initial top view/initial front view) is just small letters (top view) and small letters with a prime (front view), lettering in second stage (final top view/ final front view) is done with same notation with a subscript of 1.
A solid is represented by its edges, hence properly joining the edges completes its view.
Joining two corners means a straight line is drawn joining these two points in that view. (i.e. an edge 12 is formed by drawing a st line joining corner ‘1’ with corner ‘2’)
The complete solid is strictly drawn by/obtained by simply joining the corners of solid  using below logic
In the case of a prism, all the base corners are joined sequentially (we have base corners named as 1, 2, 3 etc). i.e. join corner 1 with 2 with a straight line to get first base edge, then join 2 with 3 with a line to get next edge, then 3 with 4 and so on, join the nth corner with the first corner. Thus all the base edges are obtained by joining all the base corners. Now we got the base surface of the solid, the same procedure is applied to join all the corners in the top surface (join corner ‘a’ with corner ‘b’, join corner ‘b’ with ‘c’, and so on to get all the edges in top surface. Remember that the bottom and top surface are the actual polygon which defines the solid. Now we have completed joining all the corners in top surface and bottom surface respectively, next we need to join lateral edges of the prism. This is done by joining base corner with corresponding/matching top corner (i.e base corner 1 is joined with top corner a, base corner 2 is joined with top corner b, corner 3 joined with c and so on.) And finally all the base corners are joined with top corners (i.e line 1-a, line 2-b, line 3-c etc) thus we get all vertical edges of the solid. FINAL CHECK: in any view the prism MUST have n+n edges (lines).

Pyramid corner joining logic : In the case of a pyramid, all the base corners are joined sequentially. i.e. join corner 1 with 2, then 2 with 3, then 3 with 4 and so on, join the nth corner with the first corner. Thus all the base corners are joined and all the base edges are drawn. Now the top corner (centre point ‘o’ of the polygon in true shape/initial view) is marked as corner o (apex of the pyramid), Remember that the bottom surface is the actual polygon which defines the solid. next we need to join/draw slant lateral edges of the pyramid. This is done by joining base corner with top corner (apex o which is centre point in initial view) (i.e base corner 1 is joined with top corner o which is centre of polygon, similarly base corner 2 is joined with top corner o, corner 3 joined with o and so on.) And finally all the base corners are joined with top corners (apex - pont o)(i.e 1-o, 2-o, 3-o etc) thus all slant edges of the pyramid are represented.


The type of projection is first angle projection where the TV is drawn below reference (xy) line, and front view drawn above xy line.
Naming the corners is always done in small letters (top view in small letters, numbers, and front view with a dash)
The initial top view and front view are names without any suffix, but the second stage top view and front view are labed with a suffix 1 for the same corners (the convetion is same i.e. front viw is with small letter with a dash, top view is in small letters alone)


*** CASE A: *** solids with axis perpendicular to HP

1) Axis Perpendicular to HP
When the axis is perpendicular to the Horizontal Plane (HP), the Top View (T.V.) which is drawn below the xy line shows the true shape of the base.

Step-by-Step
Draw the Reference Line (XY Line) for about 5 times axis length and name it as x, y (x on left end, y on right end). The region below this line will be used for the Top View, and the region above this line will be used for the Front View (As per first-angle projection). The reference line is drawn approximately at the centre of the canvas (both vertically centred and horizontally centred)

Determine the Base Orientation

Since the solid axis is perpendicular to HP, the Top View is simply the true shape of the polygon (triangle, square, pentagon, hexagon, etc. for both prism or pyramid) or circle (for cones/cylinders). However, you also have to orient the base edge (one of the sides of the polygon) correctly with respect to the Vertical Plane (VP) (i.e xy line). Often, the problem states:

“One of the base edges is inclined at 30° to VP,” or “One of the base edges is parallel/perpendicular to VP.” In these cases you have to draw the polygon, by keeping one of the sides as per given edge angle.

Translate that condition into an angle (beta) in your Top View: you typically measure that angle from the XY line (since XY is the intersection of HP and VP). 

Draw the Base in Top View

30 mm Below the XY line and 40 mm from left end of xy line (just to provide some gap for the Top View below xy), construct the regular polygon (polygon shape as mentioned in the question such as triangular, square, pentagon or hexagon) or circle (cylinder or cone is mention in the question) with the given angle beta (e.g., one edge at 40° from the XY line if it’s 40° to the VP). 

Detailed drawing procedure:
mark a point ‘a’ (corner of the solid) 30mm+base edge (side) length below xy line and 40 mm from left end of xy line, and starting from that point draw a line downwards (further away from the reference line) of length equal to the given side length (base edge length) and the angle of that line is equal to the given angle beta, mark the other end as point ‘b’. Considering this line as one of the sides of the polygon (which is ‘ab’, subsequent edges are drawn based on the polygon construction. in other words, Draw the first edge from point 'a' at angle β measured from the XY line (horizontal), directed away from the XY line into the Top View region. Use the below formula to construct subsequent edges.
Angle included between two adjacent edges/two adjacent sides is given by insideAngle= 180 - (360/no of edges), for example in case of pentagon the inner angle is 72 degree [ 180 - (360/5) = insideAngle]
Using the above angle calculation construct all other edges from the first side and complete the polygon. At corner 'b', relative to the direction of edge 'ab', rotate the drawing direction clockwise by (180 - insideAngle) degrees [external angle] to draw edge 'bc' of the specified length."
At the end of step 1 we will have a polygon with one of the sides inclined to xy as per the specified angle. Finally extend a thin line from the side which makes angle beta with xy till xy line to indicate the angle alpha and mention the value also (dimensioning as per drawing standards) - (this is the first edge we have drawn to start with).

For a polygonal base, use standard geometry construction to get equal sides (it’s a regular polygon).

Mark the center of the polygon (base of the solid)  as “O” (this is where the axis will pass). AFter drawing the base, draw a line from the side which makes the given angle with xy till xy line, this is to demonstrate that one of the sides is making a specified angle with xy line. 
In case of prism only the polygon is drawn, and centre point o is marked. But in case of pyramid all the corners are joined using the corner joining logic (which means that each corner of teh polygon is also joined with the centre of the polygon, i.e. each base corners are joined with apex of the pyramid, and those lines represent the slant edges.

Name the Corners


At the end of step 3, if the given solid is a prism we will have a polygon with n corners (polygon also have n sides /edges), for a prism with an n-sided base, label the bottom corners in a counterclockwise manner: i.e each corner of the polygon is labeled as a, b, c, … etc.representing top ‘n’ - corners of the prism and store the coordinates of these corners.  Similarly the same corners are again labeled as 1,2,3 etc corresponding to each corner/point of the lower n base corners. (since we have two separate bases one top and other bottom). Naming should Start from the lower left corner of the polygon which is already drawn below the xy line. simply put, Name corners starting from the first point, proceeding in the direction of edge construction (which appears clockwise when viewed on-screen in the canvas coordinate system)

Typically, for a prism with a top base and bottom base, label the top corners a, b, c, d … and the bottom corners are hidden below the top corners (i.e. corners 1, 2, 3,….are right below a, b, c etc). In order to represent the visible and hidden corners correctly, each corner will be labeled/named as a, b, c, d etc (top corners) and label 1, 2, 3, 4 etc are mentioned within brackets (representing that these corners are below the a, b, c, d ..corners but coinciding with a, b, c, d etc. hence the lower corners 1, 2, 3 are labeled within  brackets. ( for example if hexagonal prism is given all the six corners of hexagon in top view will be labeled as a(1), b(2), c(3), d(4), e(5) and f(6) where 1,2,3,4,5,6 represent bottom six corners of hexagon starting from lower left corner of the top view, and naming in counter clockwise direction for all the six corners. Ensure that naming is not overlapping, always labels are given without overlapping, and mentioned side by side. 

At the end of step 3, if the given solid is a pyramid we will have a polygon with n +1 points, n- corners of the polygon (representing each base corner of the pyramid) and the centre point of the polygon (representing the apex of the pyramid). Incase of a pyramid, we need to draw the polygon shape as per the given question, also the polygon shape will be drawn as per the given orientation with one side of the polygon making the given angle with xy line. And since the pyramid has n - base corners, and one top corner (apex), the naming will be done as follows. First name all the corners of the polygon as 1, 2, 3 etc and the pyramid has only one base hence no need for a, b, c etc. but the apex, (centre-o) is marked at the centre of the pyramid. 
At the end of step 4 we shall have the coordinates of each corner stored. I.e we must have each corner of prism/pyramid mapped with corresponding coordinate in that view. Hence all 2n corners(1,2, 3..n and a, b, c,...n) will have 2n coordinates (can be stored using proper key/value mechanism) for a prism, likewise n+1 corners (1,2, 3  ..n + ‘o’) of a pyramid are stored. 

Project to the Front View

At the end of step 4 we will have the top view (which is a plain polygon for prism, but plain polygon with each corner joined with the centre in case of pyramid). 
From each corner in the Top View (labeled as 1, 2, 3 ..n corners), draw vertical projector lines (n lines) up to the reference line (xy) and mark the intersection of vertical projector with xy lines as base corners (1’,2’,’3 etc) respectively (in front view). For example if a vertical projector line is drawn from corner 1, the point it intersects at xy line is marked as 1’. likewise for each of the other corners (1,2,3,4 etc) including point ‘o’ vertical lines are drawn from all the corners of the given solid. (though some lines may coincide) respective base corners will be marked in the xy line (considering base is resting on HP). After marking base corners, then we will have two different approaches based on the type of solid.

If the solid is a prism, 
After drawing and marking the base corners (1’, 2’, 3’ etc), we have to draw the vertical lines equal to the length of the solid height (axis length) from each of the base corner (n - vertical lines representing vertical edges drawn from n corners of the base in front view) and name the top corners as a’, b’ c’ etc. the corner a’, b’, c’ are labeled exactly above 1’, 2’, 3’ etc correspondingly. now join all the base edges and join all the vertical of the solid (use hidden edge algorithm and also use the edge joining logic). Apart from these, we also must project the axis from the top view upto xy line (since axis is imaginary line we cant give any naming as it doesn't have any real corner), and from xy line represent the axis line till the top of the solid (which is equal to the length of axis above xy line), but here in case of prism the axis line is not a real edge, so not labeled or named. For a prism, each top corner in front view will be at the same level (assuming a right prism). Connect them with horizontal edges (since the top face is parallel to the base).

If the solid is a pyramid, 
After drawing and marking the base corners (1’, 2’, 3’ etc), we have to draw the slant edges (inlined edges/lateral edges). But before that, we must project the axis from the top view upto xy line (since axis is imaginary line we cant give any naming as it doesn't have any real corner), and from xy line draw the axis line till the top of the solid (which is equal to the length of axis above xy line) and name the apex as o’, but here in case of pyramid the apex lies along the axis and apex lies at the top. For a pyramid, there will be an apex. The apex is typically on the axis, so from “O” (center of the base in the top view), draw a projector to locate “O’” above the XY line at a height equal to the axis. From each base corner (1’ 2’, 3’, etc.), draw lines to the apex O’ in the front view (use hidden edge algorithm). And finally we follow edge joining logic to complete the solid representation in front view.

For a cylinder, the top view is a circle, so in the front view it becomes a rectangle (if axis ⟂ HP), with height equal to the axis.

For a cone, the top view is a circle, and in the front view you see a triangle with the apex on the axis.

Identify Visible vs. Hidden Edges

In the front view, some edges (lines) may be behind the solid, so they become dashed (hidden lines). Others remain continuous (visible edges).

In CASE A, which is the true shape in top view (the polygon shape), all the edges of the polygon are visible (both for prism and pyramid) and are drawn using continuous lines.
When projected to the front view, the edges are drawn using below rules. First all the outermost points (corners of the solid) are joined. After that find those corners that are closer to xy line with respect to centre (i.e. those corners just above the centre of the polygon and below xy line) of the polygon in top view, the vertical edges that are drawn from these points are invisible hence they must be drawn using hidden line from base to top (till base we have projector line in thin line.
Final Checks & Darkening

Once all construction lines are in place, darken the final outlines and edges that remain visible.

Carefully add any hidden lines (if required) with dashed lines.

Label the front view corners (A’, B’, C’… or 1’, 2’, 3’… or apex O’), and label the axis.

This completes the typical procedure for a solid with axis perpendicular to HP.

*** CASE B: *** solids with axis perpendicular to VP

When the axis is perpendicular to the Vertical Plane (VP), the Front View shows the true shape of the base.

Step-by-Step procedure

Step 1
Draw the Reference Line (XY Line) for about 5 times axis length and name it as x, y (x on left end of the line, y on right end of the line). The region below this line will be used for the Top View, and the region above this line will be used for the Front View (As per first-angle projection). The reference line is drawn approximately at the centre of the canvas (both vertically centred and horizontally centred)


STEP 2
Draw the Front View True Shape

Since the axis is perpendicular to VP, the true shape of the base will be seen in the Front View (above XY). Now the front view is a true shape of the polygon (triangle, square, pentagon, hexagon, circle). 

In order to draw the true shape the following details are required, 1. Polygon shape (as identified by the name of the solid) 2. Side length (edgeLength ) of the polygon (given as base edge length or base side length) 3. Orientation of the polygon (alpha) with respect to the xy line 4. Location of the true shape with respect to xy line (distance ‘h’ from xy line, if the solid rests on HP then h =0)
Angle alpha is determined using following keywords:
If the given solid is a prism, the angle alpha is mentioned by following  keywords
Prism is resting on HP on its rectangular faces/ prism is resting on its lateral surface on HP means alpha=0, prism is resting on HP one one of its longer edge with the faces containing the longer edge equally inclined means alpha=45 degree, or the prism rest on HP on one of its longer edge such that the face containing the longer edge makes alpha angle with HP.simply, When prism rests on rectangular face: first edge of polygon is drawn horizontally from the starting point. When resting on longer edge: first edge is drawn at angle α from XY
If the given solid is pyramid, the solid rest on HP on one of its base edges means angle alpha equal to zero, the pyramid rest on HP on one of its base corner such that one of the base edge is making alpha angle with HP.

Now based on these given data we will proceed with drawing the true shape.
The first corner of the polygon in front view is marked 30mm from the left end of the xy line and ‘h’ distance above the xy line (if the solid rests on HP, then h=0, and hence the first point will be marked on the xy line). After marking the first corner which is named as 1’, mark the second point at a distance of edgeLength from the first point (on the right side of first point) such that the line joining 1’ and 2’ makes an angle of alpha with xy line. Now we have a straight line (1’-2’) representing one side of the polygon. Length of line 1’-2’ is equal to side length of polygon, angle of the line with xy is defined by angle alpha, position of the first point defined by ‘h’ (distance of solid from HP). Now we need to complete the polygon (which is completely above the reference line, MUST no go below xy line), by considering this line as one of the edges (use proper logic, strictly remember that the first line 1’-2’ serves as one of the edges/sides of the polygon and rest of the sides are drawn from 2’ such that 2’-3’. 3’-4’ etc are drawn as per the number of sides, remember that the nth side is the closing side of the polygon. The complete polygon is drawn such that the final polygon is completely above xy line (either touching/lying on HP i.e xy line or above xy line as per given distance.

STEP 3:
 Naming:
 Already we marked 1’, 2’ for first two corners and name the subsequent corners with 3’, 4’ etc. mark subsequent corners based on the shape. In case of prism the corners are marked as 1’, 2’, 3’, 4’ etc for the end which is in front of the observer and a’, b’, c’ etc marked on the rear end of the prism (i.e. naming will be 1’ (a’), 2’(b’) etc fro the n corners in the front view (since the prism has n corners in one end, and n corners in the other end hence one end is named as 1’, 2’, 3’ etc and other end is named as a’, b’, c’ etc but ensure that naming of corners should not overlap but they are given side by side. In case of pyramid we have only n base corners and one apex corner. Hence we mark 1’, 2’, 3’, 4’ etc at one end, and the apex (centre point of the polygon) is named as o’. FInally join all the corners (points) to get final front view. Use the logic of joining corners for prisms and pyramids which was detailed earlier.


STEP 4:
Project Downwards to Get the Top View

Now we have the front view (true shape with proper naming of each corner). Now draw axis line from the centre of polygon in front view, in downward direction. Draw the axis line below xy for about 30 mm. Let us consider that as the one end of the given solid. From that point extend the axis line vertically downwards for the length of axis length (height of the solid) as given  in the question, if the given solid is a pyramid, then the other end is marked as apex o, in case of prism we will have to draw downward vertical lines (representing the longer edges of the prism). Now for prism, project all the corners 1’, 2’, 3’ and a’, b’, c’ from the front view in downward direction and extend for 30 mm below xy line to mark one end of the solid 1, 2, 3 etc. (remember that both for prism and pyramid we have one end for sure) and Join all the base corners (i.e. all the points projected in top view. Now in case of prism extend all the base corners (1’, 2’, 3’ etc) and draw lines downward for a length equal to axis length to get the other end and marks respective corners as a’, b’, c’ etc. in casse of pyramid, we have already marked corner (apex0 o in the top view, now join all the base corners in top view with apex o to get all the slant edges (1o, 2o, 3o 4o etc)


Complete the shape in the top view:

For a prism, you’ll see parallel edges (top base corners align with the bottom base corners).

For a pyramid, you’ll see lines converging at the apex in some orientation.

For a cylinder or cone, the top view might look like a rectangle (for the cylinder’s bounding box) or a circle (for the base) or a line (for side edges, depending on the shape orientation).

Identify Visible vs. Hidden Edges in the top view.

Darken the final outlines, add dashed lines for hidden edges, and label all corners in top view (A, B, C… or 1, 2, 3… with primes or other notations as needed).

CASE C: Axis Inclined to HP
IF the problem falls under this category, then we can solve the problem in two phases.

Phase I:
step1
In phase1 we initially place the solid with the axis perpendicular to HP and complete the initial top view (true shape) and front view by following the steps given for CASE A (solids with axis perpendicular to HP). the following parameters will be used in this initial position.
Side length - as given in the question, axis length - given in the question, Edge angle as per below instructions. 

The angle beta (angle of one of the sides with xy line) will be based on the given key words.
In case of prisms and pyramids, if the solid rests on one of its base edges then angle beta is equal to 90 degree and the polygon is drawn such that one of the vertical side of the polygon will be on the right side (the polygon MUST be drawn such that one of the vertical side is placed on the right side of axis point). simply put, If resting on base edge: Orient polygon so that edge is perpendicular to XY (β=90°), placed on the right side of center. The reason is: when the solid rests on a base edge, that edge must appear as a point in the FV (perpendicular to VP), so it must be drawn perpendicular to XY in the TV. The right-side placement ensures the resting edge projects correctly.
 
If the solid rests on one of the base corners then the following procedure MUST be adopted for each shape. For triangle one side will be perpendicular but the vertical edge will be on the left side of the polygon (left side of center of polygon), in case of square the angle will be 45 degrees, in case of pentagon the angle of one of the sides is 90 degree but the side will be drawn on left side, in case of hexagon the angle will be equal to zero.
Based on these angles, we will draw the initial top view and initial front view exactly as per the steps in CASE A, and naming also to be given for each and every corner. simply put, If resting on base corner: Orient polygon so the resting corner is the rightmost-lowest point, with adjacent edges symmetrically inclined. The reason is: when the solid rests on a base corner, that corner must appear as a point in the FV (on XY), so it must be the rightmost point in the TV to allow symmetrical projection of the base.
Remember that here no edge angle will be given, just resting on base edge or basse corner through which we have to infer the base edge angle.

PHASE II

Phase 2 involves further steps to get the final front view and final top view.
Step 2

Now based on resting on the base edge or resting on the base corner of the solid we have the initial top view and initial front view from phase I. Now after drawing the initial views we have to proceed with step 2. In step 2 we draw the final front view which is drawn based on the initial front view of the solid. The procedure is given below.
Now after completing the initialFV, we need to reproduce the exact shape of the initialFV (in which the axis is perpendicular to xy line) in the final FV such that the axis makes the given axis angle specified in the problem, also the rightside corner still on HP (xy line). In other words the figure obtained in front view is tilted(rotated wrt the lower right corner point) about the lower right point of the figure and this new tilted diagram is drawn separately on the same xy line with a gap of (45mm +2 times side length ) from the initial view. Now at the end of initialFV a prism has 2n corners, and a pyramid has n+1 corners. All the 2n corners of the prism was named properly with lower corners as 1’, 2’, 3’ etc, and top corners as a’, b’, c’ etc. Now we also have the exact coordinate positions of each corner in the initial front view, now all these corners has to be rotated by an angle theta (inclination of axis with HP) about the right lower corner of the initial front view, And the naming has to be done as 11’, 21’, 31’, 41’ etc likewise a1’, b1’, c1’, etc (i.e. a letter with suffix of 1, and prime for FV). the naming MUST be done just same as that of initial views. In order to make the procedure intuitively understanding for the students we can follow below procedure. Now we have the initial top view (true shape of the polygon), and initial front view (showing axis length, and solid in vertical position (axis vertical to xy). Now we marked all the corners of both the front and top views. Third drawing is the final frontview which is replica of the initial FV but with rotation. Hence we use below logic to make the concept easy to understand and easy to draw. I.e. we take the initial front view of the solid (we have 2n corners in case of prism, and n+1 corners in casse of pyramid), we also stored the coordinate of each corner(i.e coordinate of 1’, 2’, 3’ etc and a’, b’, c’ etc are stored). Now take the lower right corner of the shape/drawing in initial front view, and rotate the entire drawing, rotate each corner by considering the lower right corner as pivot and complete the final front view with just rotation. And join all the corners just using corners joining logic or prism as well as pyramid. After rotation, now we stored the new coordinates under new names (11’, 21’, 31’ etc, and a1’, b1’, c1’ etc). Then translate the entire drawing (newly rotated shape 11’, 21’, 31’ etc, and a1’, b1’, c1’ etc) along xy line to a new position which is 45mm +2 times side length away from the pivot corner. Thus we provided a visual cue that the new rotated drawing is just the same shape with same dimensions, same edges but with axis and all other edges inclined to HP correspondingly (the relative angles between each corner is unchanged). Now we have got the final front view. Once check for all the corners in the new drawing (prisms 2n corners, pyramids n+1 corners), and also check naming is given or all the corners as per the solid type (each corner is named based on the rotated parent corners, but with a subscript of 1)

STEP 3:
The last step is to draw the final top view of the solid. The procedure is given below. After step 2 we have the final front view with all the corners marked and coordinates stored, likewise we also have the initial top view with all the corners marked. Now draw vertical projector lines from each and every corner (11’, 21’, 31’ etc, and a1’, b1’, c1’ etc in case of prism we must draw 2n vertical lines where n - no of corners, and in case of pyramid we must draw n+1 vertical lines) in the final front view downwards such that these vertical lines are drawn below xy line till the lowest point in the initial top view. I.e. identify the lowest corner in the initial top view (the corner with least value of y coordinate), and the vertical lines from each corner in the final front view has to be drawn to match this lowest y axis value. Now draw horizontal lines from each and every corner in the initial top view (again 2n horizontal lines for prism, n+1 horizontal lines for pyramid) till the right most vertical projector line. Now we will have each horizontal locus line intersecting the vertical projector line from each of the corner. Now for every horizontal line from each corner, check for corresponding vertical line from the same corner (i.e if horizontal line is  drawn  from corner a, check for vertical line from a1’, similarly for all other corners checck for the intersection) and name the corners of intersection as a1, b1, c1 etc, and 11, 21, 31 etc representing the final top view. 

STEP4
Joining visible edges and drawing hidden edges
Use below logic for drawing visible and hidden edges
In any view, always the outermost points (corners) will be visible. 
In any view two visible lines can not cross each other.
Hence in stage I, which is the true shape in top view (the polygon shape), all the edges of the polygon are visible (both for prism and pyramid) and are drawn using continuous lines.
When projected to the front view, the edges are drawn using below rules. First all the outermost points (corners of the solid) are joined. After that find those corners that are closer to xy line with respect to centre (i.e. those corners just above the centre of the polygon and below xy line) of the polygon in top view, the vertical edges that are drawn from these points are invisible hence they must be drawn using hidden line from base to top (till base we have projector line in thin line.

After completing first stage, now second stage front view is a replica of the front view from first stage except the rotation of the entire shape with respect to the pivot which is the lower right corner/point of the solid (which lies on HP also). Now below procedure MUST be used for joining visible and invisible edges in final top view (top view in second stage)
First join all the outermost corners, always the outermost corner will be visible.
In case of prism, join all the corners of the top surface (a1, b1, c1 etc) using visible lines. Then check for any base corner which is not yet joined, (we joined only outer most corners, and all the corners in the top surface), join remaining base corners (11, 21, 31, ect)  with hidden lines (dashed lines), finally if any corner is joined with two hidden line, then the corresponding longer edge is also hidden, so join all the longer edges by hidden lines (if a corner has two hidden base edges)
In case of pyramid we joined all the outermost corners, then by rule of thumb the base is at the bottom and hance part of it will be invisible, so if there are any base corners not yet joined, join them using hidden lines. Now finally join all the base corners with the apex o, for that if a base corner is joined by two hidden lines then it will be joined with the apex using hidden line, all other basse corners are joined using visible lines.


4) Axis Inclined to VP
Again, a two-step approach:

Step-1: Assume axis is perpendicular to VP. Draw initial views.

Step-2: Tilt/rotate the Top View so that the axis is inclined by the given angle to VP. Then find the final front view from that new top view.

Step-by-Step
Initial Setup (Axis ⟂ VP)

Draw the Front View that shows the true shape of the base.

Project down to get the corresponding Top View. Label corners, mark the axis.

Tilt the Axis in the Top View

Now, you have to rotate/tilt the top view so that the axis is at the given inclination with the VP.

Suppose the problem states that the axis is at 40° to VP. That means in top view, you want the axis to be drawn at 40° from some reference line.

Redraw the top view in this new inclined position (“Step-2 Top View”).

Project Upwards to Get the Final Front View

From each corner in the “Step-2 Top View,” draw vertical lines upwards.

From the “Step-1 Front View,” draw horizontal locus lines.

Intersection of these lines gives the final front view corners.

Connect them appropriately, darken visible edges, and dash hidden edges.

Finish & Label

Identify the final corners (A’, B’, C’, …).

Mark the axis with its new position in top view or front view.

Show the angle of inclination with respect to VP (usually measured in the top view).

General Tips & Checks
Keep Constructions Light: Use 2H or 3H pencil for construction lines (projectors, loci). Use HB or darker pencil for final outlines.

Label Carefully: In complex solids (like a hexagonal prism), it’s easy to lose track of which corner is which. Always keep consistent labeling between top, front, and side views.

Use Dashed Lines for edges behind the solid.

Maintain Enough Space: Leave a clear gap between the base and the XY line. Typically, 10–15 mm minimum from XY to the shape so that you can draw dimension lines if needed.

Dimension & Indicate Angles as required by the problem statement (e.g., base side length, axis height, angle with VP or HP).

Prisms vs. Pyramids:

In a prism, the top face is parallel and congruent to the base.

In a pyramid, all side edges meet at a single apex.

The projection approach is the same, but in a pyramid’s front or top view, you’ll see lines converging at the apex.

Summary Flow
Perpendicular to HP or VP: Directly draw the true shape of the base in the view (Top or Front) where it appears true, then project to the other view.

Inclined to HP or VP: Use a two-step approach. First, draw as if perpendicular; second, tilt to the required angle and re-project to get the final view.

That’s the overall logic for each category of problem in first-angle projection. By walking through these steps carefully on a drawing sheet, you should arrive at accurate views of the solid in question.
