import BASE_URL from 'Base/api';
import { useState, useEffect } from 'react';

const getSettingValueByName = (nameOrId) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/AppSetting/GetAppSettingValueByNameAsync?name=${nameOrId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
      //
      } 
    };

    fetchData();
  }, [nameOrId]);

  return { data };
};

export default getSettingValueByName;
