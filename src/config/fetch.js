import {baseUrl} from './env'

export default async (url = '', data = {}, type = 'GET', method = 'fetch') => {
    //将请求的方法设置为大写
    type = type.toUpperCase();

    //设置请求的url
    url = baseUrl + url;


    //get方式请求
    if (type == 'GET') {
        let dataStr = ''; //数据拼接字符串
        Object.keys(data).forEach(key => {
            dataStr += key + '=' + data[key] + '&';
        })

        if (dataStr !== '') {
            dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
            url = url + '?' + dataStr;
        }
    }

    //其他请求方法
    if (window.fetch && method == 'fetch') {

        //请求配置
        let requestConfig = {
            credentials: 'include',
            method: type,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: "cors",
            cache: "force-cache"
        }

        //如果请求类型为post，修改config对象的body属性的值
        if (type == 'POST') {
            Object.defineProperty(requestConfig, 'body', {
                value: JSON.stringify(data)
            })
        }

        try {
            //同步等待响应结果
            const response = await fetch(url, requestConfig);

            //同步等待将结果转成json格式
            const responseJson = await response.json();
            return responseJson
        } catch (error) {
            throw new Error(error)
        }
    } else {

        //如果不支持fetch就使用XMLHttpRequest的方式请求
        return new Promise((resolve, reject) => {
            let requestObj;
            if (window.XMLHttpRequest) {
                requestObj = new XMLHttpRequest();
            } else {
                requestObj = new ActiveXObject;
            }

            let sendData = '';
            if (type == 'POST') {
                sendData = JSON.stringify(data);
            }

            //状态变更处理函数
            requestObj.onreadystatechange = () => {
                //http响应已经完全接受
                if (requestObj.readyState == 4) {
                    //响应状态为200时
                    if (requestObj.status == 200) {
                        let obj = requestObj.response
                        if (typeof obj !== 'object') {
                            obj = JSON.parse(obj);
                        }
                        resolve(obj)
                    } else {
                        reject(requestObj)
                    }
                }
            };

            requestObj.open(type, url, true);
            requestObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            requestObj.send(sendData);
        })
    }
}
