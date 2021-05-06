
const fs = require('fs')

// This script processes a markdown file and adds numberings to headings.
// Example 
// "# Section"
// "## Subsection"
// ->
// # 1 Section
// ## 1.1 Section
const regex = new RegExp("(#+)\\s+\\w");
const referenceregex = /(\[([A-Za-z0-9\-\ \&]+)\])(\(\#)([A-Za-z0-9\-\ \&]+)(\))/g;
const blockmatchregex = /`/g;//new RegExp("\\`\g");
let headermap = {}

fs.readFile('READMEPRE.md', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    {

        const lines = data.split("\n");
        let out = ""
        let levelscounts = []

        let even = 0;
        for (line in lines) {
            let currstring = lines[line];
            let blocks = currstring.match(blockmatchregex);
            // if (blocks !== null)
            //     console.log("" + blocks + " " + currstring);
            even = (even + (blocks ? blocks.length : 0)) % 2;
            if (even == 0 && currstring.search(regex) == 0) {
                let level = 0;
                while (currstring[0] === "#") {
                    currstring = currstring.substring(1)
                    level++;
                }
                while (currstring.search("\\w") === 0) {
                    currstring = currstring.substring(1)
                    // level++;
                }
                let header= currstring;
                // console.log("header:"+header);
                // let convertedheader=header.replace(/(\s)+/g, "-");
                // console.log("header:"+header+" -> "+convertedheader)
                let hashes = "" + ("#".repeat(level)) + " ";
                let levelstring = "";

                for (let i = 0; i < level - 1; i++) {
                    if (levelscounts.length == i) {
                        levelscounts.push(1);
                    }
                    levelstring += "" + levelscounts[i] + "."
                    // console.log(levelscounts)
                }
                if (levelscounts.length == level - 1) {
                    levelscounts.push(1);
                }
                else {
                    levelscounts[level - 1] = levelscounts[level - 1] + 1;
                }

                levelstring += "" + levelscounts[level - 1]
                levelscounts = levelscounts.slice(0, level);
                currstring = hashes +levelstring + header;
                headermap[header.replace(/(\s)+/g, "-").toLowerCase().substring(1)]=levelstring+header;
                // console.log(currstring);
                lines[line] = currstring;

            }
            else {
                lines[line] = currstring;
            }
        }

        for (line in lines) {
            let currstring = lines[line];
            let blocks = currstring.match(blockmatchregex);

            even = (even + (blocks ? blocks.length : 0)) % 2;
            if (even == 0 && currstring.search(regex) == 0) {
                lines[line] = currstring;
            }
            else {
                lines[line] = currstring;
            }

        }
        console.log(headermap);

        function replacefunction(match, p1, p2, p3, p4,p5, offset, string) {
            // console.log("--------")
            // console.log("match:" + match)
            // console.log("p1:" + p1)
            // console.log("p2:" + p2)
            // console.log("p3:" + p3)
            // console.log("p4:" + p4)
            // console.log("p5:" + p5)

            // console.log("offset:" + offset)
            let header =headermap[p4.replace(/(\s)+/g, "-").toLowerCase()];
            let convertedheader=""

            if (!header){
                console. error("No matching header "+ p4.replace(/(\s)+/g, "-").toLowerCase() + " line "+line)
            }
            else{
                convertedheader=header.replace(/(\s)+/g, "-").toLowerCase();
                console.log(header+" -> "+convertedheader);
            }
            return p1+p3+convertedheader+p5;
        }

        for (line in lines) {
            let currstring = lines[line];
            currstring=currstring.replace(referenceregex, replacefunction);
            out += currstring + "\n"
        }
        fs.writeFile("README.md", out,
            function (err) {
                if (err) return console.log(err);
                console.log("wrote README.md");
            });
    }
    {

        // const blockmatchregex = /`/g;//new RegExp("\\`\g");
        // let even = 0;
        // let currstring = "`journalctl -u homecontrol -f`";
        // let blocks = currstring.match(blockmatchregex);
        // console.log(blocks)
        // if (blocks)
        //     console.log("???" + even + blocks + " " + currstring);
        // even = (even + (blocks ? blocks.length : 0)) % 2;
        // console.log("???" + even + blocks + " " + currstring);

        // let string2 = "for more information, see [test test](#testreference), and maybe [test3](#test reference 3)";
        // function replacefunction(match, p1, p2, p3, p4,p5, offset, string) {
        //     console.log("--------")
        //     console.log("match:" + match)
        //     console.log("p1:" + p1)
        //     console.log("p2:" + p2)
        //     console.log("p3:" + p3)
        //     console.log("p4:" + p4)
        //     console.log("p5:" + p5)

        //     console.log("offset:" + offset)
        //     let convertedheader=p4.replace(/(\s)+/g, "-");
        //     return p1+p3+convertedheader+p5;
        // }
        // console.log(string2.replace(referenceregex, replacefunction))
        // console.log(string2.match(referenceregex))

        // let referencematches=string2.match(referenceregex);


    }

})



