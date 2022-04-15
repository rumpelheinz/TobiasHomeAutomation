//https://discovery.meethue.com/

import axios from "axios";

export class HueController {
    APIKey: string;
    urlbase: string;
    constructor(
        APIkey: string,
        ip: string
    ) {
        this.APIKey = APIkey;
        this.urlbase = ip;
    }

    async isRunning() {
        let url = this.urlbase + '/api/' + this.APIKey ;
        // console.log(url)
        let res = await axios.get(url,
            {}
        )
        console.log(res.statusText);
        if (res.data.length > 0 && res.data[0].error) {
            console.error("HueController Error", res.data[0].error)
            throw res.data[0].error;
        }
        else {
            console.log(res.data)
            return res.data;
        }
    }

    async getLightStatus(index: number) {
        let url = this.urlbase + '/api/' + this.APIKey + '/lights';
        console.log(url)

        let res = await axios.get(url,
            {}
        );
        console.log(res.statusText);
        return res.data;
    }

    async setLightStatus(index: number, config: any ) {
        let url = this.urlbase + '/api/' + this.APIKey + '/lights/' + index+'/state';
        console.log(url)

        let res = await axios.put(url,
            config
        );
        console.log(res.statusText);
        console.log(res.data);
        return res.data;
    }
}



// let hueController = new HueController('HE-iXMU7uUkEoGq318bFj6S7xHTnXHKbYkx3Xe4w', "http://192.168.0.140");
// hueController.isRunning();

// let res=await hueController.getLightStatus(2);
// console.log(res);