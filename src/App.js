import {
  APIProvider,
  Map, AdvancedMarker,
  Pin, InfoWindow,
} from "@vis.gl/react-google-maps";

import './App.css';
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, LoadScriptNext, Marker, MarkerF } from '@react-google-maps/api';
import axios from 'axios';
import { FaPeriscope } from 'react-icons/fa';

import Config from 'react-native-config';

// export default function Intro() {
//   const position = { lat: 37.450354677762, lng: 126.6591561433 };

//   return (
//     <div className="MapOnRight" style={{ flex: 1, border: '1px solid #ccc' }}>
//       <APIProvider apiKey={"AIzaSyD3emR18UvttRCebTeZ6xkC9G9Jd4HrUoM"}>
//         <div style={{height: "100vh", width: "100vh"}}>
//           <Map 
//               zoom={16}
//               center={position}
//               mapId={"893a53dabe478668"}
//               options={{
//                 // minZoom: 15,
//                 // maxZoom: 17,
//                 styles: [
//                   {
//                     featureType: 'all',
//                     elementType: 'labels.text.fill',
//                     stylers: [
//                       { saturation: -100 },
//                       { color: '#000000' }, // 텍스트를 검은색으로
//                     ],
//                   },
//                   {
//                     featureType: 'poi',
//                     elementType: 'labels.icon',
//                     stylers: [
//                       { visibility: 'off' }, // POI(관심 지점) 아이콘 감추기
//                     ],
//                   },
//                   {
//                     featureType: 'all',
//                     elementType: 'all',
//                     stylers: [
//                       { saturation: -100 }, // 채도를 -100으로 설정하여 흑백처리
//                       { lightness: 40 }, // 명도를 40으로 설정하여 흑백처리
//                     ],
//                   },
//                   // 다른 스타일 설정 가능
//                 ],
//               }}
//           >
//               <AdvancedMarker position={position}>

//               </AdvancedMarker>
//             </Map>
//         </div>
//       </APIProvider>
//     </div>

//   );
// }


function AppMonitor({ monitorData, onButtonClick }) {
  const [selectedData, setSelectedData] = useState(null);

  const handleBoxClick = (data) => {
    setSelectedData(data);
  };

  return (
    <div className="Observer" style={{ flex: 1, overflow: 'auto' }}>
      <div className="data-lists">
        <ul>
          {monitorData.map((data, index) => (
            <li key={index} className="data-monitor">
              <button className="data-reportBox" onClick={() => onButtonClick(data)}>
                <p> {`${data.report_time} / ${data.location} / ${data.crime}`} </p>
                <p> {`${data.reporter_type === 'P' ? "당사자" : "목격자"} / ${data.gender === 'M' ? '남' : '여'} / ${data.age} / ${data.name}`} </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SelectedDataDisplay({ selectedData }) {
  if (!selectedData) {
    return <div className="selected-data">선택된 데이터가 없습니다.</div>;
  }

  return (
    <div className="selected-data">
      <p>{`선택된 데이터 정보:`}</p>
      <p>{`${selectedData.report_time} / ${selectedData.location} / ${selectedData.crime}`}</p>
      <p>{`${selectedData.reporter_type === 'P' ? "당사자" : "목격자"} / ${selectedData.gender === 'M' ? '남' : '여'} / ${selectedData.age} / ${selectedData.name}`}</p>
      {/* 여기에 추가 데이터 정보를 표시할 수 있습니다. */}
    </div>
  );
}

function MapContainer() {
  const [dataList, setDataList] = useState([]);
  const [monitorData, setMonitorData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [readOnlyState, setReadOnlyState] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    fetchDataForMap();
    fetchDataForMonitor();
    // 3초마다 fetchData를 호출하는 setInterval을 설정
    const intervalId = setInterval(fetchDataForMonitor, 3000);

    // 컴포넌트가 언마운트될 때 clearInterval을 통해 interval 제거
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchDataForMap = () => {
    axios.get('https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/report_location/warm')
      .then(response => {
        setDataList(response.data);
      })
      .catch(error => {
        console.error('Error fetching data for map:', error);
      });
  };

  // 변수를 상태로 관리하고 초기값을 설정합니다.
  const [reportCode, setReportCode] = useState('');
  const [apiData, setApiData] = useState(null);

  const [updateData, setUpdateData] = useState({
    report_code: '',
    user_number: '',
    memo: '',
    crime: '',
    manager_name: '',
    execute_time: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdateButtonClick = () => {
    // API 호출
    fetch(`https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/update-report/${updateData.report_code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams(updateData).toString()
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('API 호출 실패');
        }
        // 성공적으로 업데이트된 경우에 수행할 작업 추가
        console.log('API 호출 성공');
        fetchDataForMonitor();
      })
      .catch(error => console.error('API 호출 오류:', error));
  };

  // const handleSearch = () => {
  //   // 검색 버튼 클릭 시 API 호출
  //   if (reportCode) {
  //     fetch(`https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/report-spec/${reportCode}`)
  //       .then(response => response.json())
  //       .then(data => setApiData(data))
  //       .catch(error => console.error('API 호출 오류:', error));
  //     fetch(`https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/user/${apiData.user_number}`)
  //       .then(response => response.json())
  //       .then(data => setUserData(data))
  //       .catch(error => console.error('API 호출 오류:', error));
  //   }
  // };

  const handleSearch = async () => {
    try {
      // 검색 버튼 클릭 시 API 호출
      if (reportCode) {
        // Fetch report-spec data
        const reportSpecResponse = await fetch(`https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/report-spec/${reportCode}`);
        if (!reportSpecResponse.ok) {
          throw new Error('report-spec API 호출 실패');
        }
        const reportSpecData = await reportSpecResponse.json();
        setApiData(reportSpecData);
        setUpdateData(reportSpecData);
  
        // Fetch user data using the updated apiData.user_number
        const userResponse = await fetch(`https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/user/${reportSpecData.user_number}`);
        if (!userResponse.ok) {
          throw new Error('user API 호출 실패');
        }
        const userData = await userResponse.json();
        setUserData(userData);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };
  

  const handleButtonClick = (data) => {
    // 버튼 클릭 시 report_code를 검색 영역에 설정하고 검색 버튼을 클릭
    setReportCode(data.report_code);
    handleSearch();
  };

  const fetchDataForMonitor = () => {
    axios.get('https://port-0-crime-detector-k9d2clpveel0s.sel4.cloudtype.app/monitor') // Spring 서버 API 엔드포인트
      .then(response => {
        if (response.data.gender === 'M') response.data.gender = '남';
        else if (response.data.gender === 'W') response.data.gender = '여';
        setMonitorData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data for monitor:', error);
      });
      
      // fetchDataForMap도 호출
      fetchDataForMap();
  };

  const handleMarkerClick = (report_code) => {
    setReportCode(report_code);
    handleSearch();
  }

  // 범죄종류에 따라 마커의 색상을 결정
  // red: 살인 강도 방화 성범죄 
  // yellow: 폭행 재산 교통
  // orange: 그 외
  const getMarkerColor = (crime) => {
    // You can customize this logic based on your requirements
    switch (crime) {
      case '살인':
        return "red";
      case '강도':
        return "red";
      case '방화':
        return "red";
      case '성범죄':
        return "red";
      case '흉기':
        return "red";

      case '폭행':
        return "yellow";
      case '재산':
        return "yellow";
      case '교통':
        return "yellow";

      default:
        return "orange"; // Default color if 'crime' doesn't match any case
    }
  };

  const getEditAreaColor = () => {
    if (readOnlyState) return '#dcdcdc';
    else return 'white';
  }

  // 지도 설정
  const defaultCenter = { lat: 37.450354677762, lng: 126.6591561433 }; // 기본 중심 좌표 (인하대)
  const defaultZoom = 16; // 초기 확대 정도
  const minZoom = 15; // 최소 확대 정도
  const maxZoom = 18; // 최대 확대 정도
  const mapStyles = { // 지도 스타일
    height: '100%',
    width: '100%',
  };
  
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        <div className='reportList' style={{ height: "70%", overflowY: 'scroll', border: '1px solid #ccc' }}>
          <AppMonitor monitorData={ monitorData } onButtonClick={handleButtonClick} />
        </div>

        <div className='inputReportCode' style={{ height: "4%", border: '1px solid #ccc', padding: '10px' , display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {/* 좌측 검색영역에 사용할 변수 입력 폼 */}
          <input
            type="text"
            value={reportCode}
            onChange={(e) => setReportCode(e.target.value)}
            placeholder="report_code를 입력하세요"
            style={{ width: "40%", paddingLeft: '5%', paddingRight: '5%' }}
          />
          {/* 검색 버튼 */}
          <button 
            style={{backgroundColor: 'white', border: '1px solid black', margin: '5px'}}
            onClick={handleSearch}>
              검색
          </button>
          <button 
            style={{color: 'white', backgroundColor: 'blue', border: '1px solid black', margin: '5px', marginLeft: '13%'}}
            onClick={() => {
              // 수정 버튼 클릭 시 readOnly 상태를 해제
              setReadOnlyState(false);
            }}
            >
              수정
          </button>
          <button 
            style={{color: 'white', backgroundColor: '#fa60d8', border: '1px solid black', margin: '5px'}}
            onClick={() => {
              handleUpdateButtonClick();
              
              // 수정 버튼 클릭 시 readOnly 상태를 해제
              setReadOnlyState(true);
            }}
            >
              저장
          </button>
        </div>

        <div className='reportInfo' style={{ height: "26%", overflowY: 'scroll', border: '1px solid #ccc', backgroundColor: 'skyblue' }}>
          {apiData && (
            <div style={{margin: 'auto', }}>
              {/* <p>API 데이터:</p>
              <pre>{JSON.stringify(apiData, null, 2)}</pre> */}
              {/* 형식
                이름 성별 나이 신고시간 전화번호 
                메모
                범죄종류/ (담당자)담당자이름 (처리일시)처리일시
              */}
              <div className='reportSpec' style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> 
                <input 
                  type="text" 
                  name="user_number" 
                  value={userData?.user_name || ''} 
                  onChange={handleInputChange} 
                  style={{ 
                    textAlign: 'center',
                    width: "10%", 
                    marginBottom: '3px',
                    marginLeft: '4px',
                    marginRight: '4px', 
                    backgroundColor: '#dcdcdc',
                  }}
                  readOnly
                />
                <input 
                  type="text" 
                  name="user_gender" 
                  value={userData?.user_gender === 'F' ? '여' : '남'} 
                  onChange={handleInputChange} 
                  style={{ 
                    textAlign: 'center',
                    width: "4%", 
                    marginBottom: '3px',
                    marginLeft: '4px',
                    marginRight: '4px', 
                    backgroundColor: '#dcdcdc',
                  }}
                  readOnly
                />
                <input 
                  type="text" 
                  name="user_age" 
                  value={userData?.user_age || ''} 
                  onChange={handleInputChange} 
                  style={{ 
                    textAlign: 'center',
                    width: "5%", 
                    marginBottom: '3px',
                    marginLeft: '4px',
                    marginRight: '4px', 
                    backgroundColor: '#dcdcdc',
                  }}
                  readOnly
                />
                <input 
                  type="text" 
                  name="report_code" 
                  value={updateData?.report_code} 
                  onChange={handleInputChange} 
                  placeholder={"신고번호"}
                  style={{ 
                    textAlign: 'center',
                    width: "40%", 
                    marginBottom: '3px',
                    marginLeft: '4px',
                    marginRight: '4px', 
                    backgroundColor: '#dcdcdc',
                  }}
                  readOnly
                />
                <input 
                  type="text" 
                  name="user_number" 
                  value={updateData?.user_number} 
                  onChange={handleInputChange} 
                  placeholder={"신고자 전화번호"}
                  style={{ 
                    textAlign: 'center',
                    width: "15%", 
                    marginBottom: '3px',
                    marginLeft: '4px',
                    marginRight: '4px', 
                    backgroundColor: '#dcdcdc',
                  }}
                  readOnly
                />
              </div>

              <div className='reportSpec' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input 
                  className= "reportEditArea"
                  type="text" 
                  name="memo" 
                  value={updateData?.memo} 
                  onChange={handleInputChange} 
                  placeholder={"메모를 입력하세요"}
                  style={{ 
                    width: "83%", 
                    height: '70px', 
                    margin: '5px', 
                    backgroundColor: getEditAreaColor ()
                  }}
                  readOnly={readOnlyState}
                />
              </div>
              
              <div className='reportSpec' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input 
                  className= "reportEditArea"
                  type="text" 
                  name="crime" 
                  value={updateData?.crime} 
                  onChange={handleInputChange} 
                  placeholder={apiData.crime}
                  style={{ 
                    width: "10%", 
                    backgroundColor: getMarkerColor(apiData.crime),
                    textAlign: 'center',
                  }}
                  readOnly={readOnlyState}
                />
                <label style={{width: '70px', textAlign: 'right', marginRight: '5px', fontSize: '15px'}}> 담당자 </label>
                <input 
                  className= "reportEditArea"
                  type="text" 
                  name="manager_name" 
                  value={updateData?.manager_name} 
                  onChange={handleInputChange} 
                  placeholder={apiData.manager_name}
                  style={{ width: "10%", backgroundColor: getEditAreaColor() }}
                  readOnly={readOnlyState}
                />
                <label style={{width: '70px', textAlign: 'right', marginRight: '5px', fontSize: '15px'}}> 처리일시 </label>
                <input 
                  className= "reportEditArea"
                  type="text" 
                  name="execute_time" 
                  value={updateData?.execute_time} 
                  onChange={handleInputChange} 
                  placeholder={apiData.execute_time}
                  style={{ width: "40%", backgroundColor: getEditAreaColor() }}
                  readOnly={readOnlyState}
                />
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="MapOnRight" style={{ flex: 1, border: '1px solid #ccc' }}>
        <APIProvider apiKey={"AIzaSyD3emR18UvttRCebTeZ6xkC9G9Jd4HrUoM"}>
          <Map
            mapId={"893a53dabe478668"}
            zoom={defaultZoom}
            center={defaultCenter}
            options={{
              minZoom: minZoom,
              maxZoom: maxZoom,
              // styles: [
              //   {
              //     featureType: 'all',
              //     elementType: 'labels.text.fill',
              //     stylers: [
              //       { saturation: -100 },
              //       { color: '#000000' }, // 텍스트를 검은색으로
              //     ],
              //   },
              //   {
              //     featureType: 'poi',
              //     elementType: 'labels.icon',
              //     stylers: [
              //       { visibility: 'off' }, // POI(관심 지점) 아이콘 감추기
              //     ],
              //   },
              //   {
              //     featureType: 'all',
              //     elementType: 'all',
              //     stylers: [
              //       { saturation: -100 }, // 채도를 -100으로 설정하여 흑백처리
              //       { lightness: 40 }, // 명도를 40으로 설정하여 흑백처리
              //     ],
              //   },
              //   // 다른 스타일 설정 가능
              // ],
            }}
          >
            {dataList.map((data, index) => (
              <AdvancedMarker
                key={index}
                position={{ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) }}
                onClick={ () => handleMarkerClick(data.report_code) }
              >
                <Pin
                  background={getMarkerColor(data.crime)}
                  borderColor={"black"}
                  glyphColor={"navy"} 
                />    
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}

export default MapContainer;