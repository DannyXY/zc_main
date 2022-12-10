import { trimUrl, filterUrl } from "./filter-url";
import axios from "axios";
import { ACTIONS } from "../reducers/sidebar.reducer";

export const plugindata = async (
  dispatch,
  organizationInfo,
  currentWorkspace,
  userId
) => {
  organizationInfo &&
    organizationInfo.map(pluginInfo => {
      let { plugin } = pluginInfo;
      console.log(plugin);
      let sidebarUrl;
      if (plugin._id == "616949129ea5d3be97df2913") {
        sidebarUrl = "http://127.0.0.1:22664/api/v1/sidebar";
      } else {
        sidebarUrl = plugin.sidebar_url;
      }
      //Get sidebar url
      //trim sidebar url of extra slashes
      let trimmedUrl = trimUrl(sidebarUrl);
      console.log(trimmedUrl);
      //filter plugin domain to use as key
      let pluginKey = filterUrl(sidebarUrl);
      console.log(pluginKey);

      //Call each plugin
      axios
        .get(
          `${
            trimmedUrl.includes("https://") || trimmedUrl.includes("http://")
              ? trimmedUrl
              : `https://${trimmedUrl}`
          }?org=${currentWorkspace}&user=${userId}`
        )
        .then(res => {
          console.log(res);
          try {
            let validPlugin = res.data?.data;
            if (Array.isArray(validPlugin)) {
              //Set plugin data to state
              let counter = 0;
              dispatch({
                type: ACTIONS.ADD_ITEM,
                payload: validPlugin
                  .filter(plugin => plugin.name)
                  .map(plugin => ({
                    ...plugin,
                    pluginKey: `${pluginKey}_${counter++}`
                  }))
              });
            } else if (typeof validPlugin === "object") {
              console.log(validPlugin);
              if (validPlugin.name !== undefined) {
                //Set plugin data to state
                dispatch({
                  type: ACTIONS.ADD_ITEM,
                  payload: [{ ...validPlugin, pluginKey }]
                });
              }
            }
          } catch (err) {
            return null;
          }
        })
        .catch(err => console.warn(err));
    });
};
