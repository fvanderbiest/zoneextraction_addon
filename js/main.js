Ext.namespace("GEOR.Addons");

GEOR.Addons.Zoneextraction = Ext
		.extend(
				GEOR.Addons.Base,
				{

					map : this.map,

                                        win: null,

                                        layerName_ZE: null,
                    
					/**
					 * initializing the addon
					 * */
					init : function(record) {

						var lang = OpenLayers.Lang.getCode();
						map = this.map;
						mapProjection = map.getProjection();
						newLayerfeature = "ExtractedPolygon";

						GEOR.WPS_Utils.initProj4jsGlobalVar();

						layerStore = Ext.getCmp("mappanel").layers;
						this.defControl();
						selectPolygon = new OpenLayers.Control.Click();
						map.addControl(selectPolygon);

						// Menu déroulant
						var wpsMenu = new Ext.menu.Menu(
								{
									items : [
											new Ext.Action(
													{
														id : "import_NF",
														iconCls : "import",
														text : OpenLayers
																.i18n("zoneextraction.import"),
														allowDepress : false,
														tooltip : OpenLayers
																.i18n("zoneextraction.tooltip"),
														handler : this.showWindow
													}),

											new Ext.Action(
													{
														id : "clickNearest_NF",
														iconCls : 'drawpoint',
														text : OpenLayers
																.i18n("zoneextraction.title"),
														map : map,
														toggleGroup : 'map',
														enableToggle : true,
														enableCheckChange : true,
														allowDepress : true,
														tooltip : OpenLayers
																.i18n("zoneextraction.tooltip"),
														handler : function() {
															selectPolygon
																	.activate();
															Ext
																	.getCmp('clickNearest_NF').checked = false;
														}

													}) ]
								});

						this.item = new Ext.menu.Item(
								{
									id : 'wps_zoneextraction',
									text : record.get("title")[lang]
											|| record.get("title")["en"],
									qtip : record.get("description")[lang]
											|| record.get("description")["en"],
									hidden : (this.options.showintoolmenu === true) ? false
											: true,
									menu : wpsMenu,
									iconCls : 'wps_zoneextraction'
								});

					},

					/**
					 * show the configuration window
					 * */
					showWindow : function() {

						serverStore_ZE = GEOR.WPS_Utils.initServerStore();
						serverStore_ZE.load();

						this.combo_Server_ZE = GEOR.WPS_Utils.initCombobox(
								'combo_server_ZE', serverStore, OpenLayers
										.i18n("zoneextraction.workspace"),
								'url', 'name', false);
						this.combo_Server_ZE.on('select', function(combo,
								record) {
							GEOR.WPS_Utils.loadNextDataStore(Ext
									.getCmp('combo_Server_ZE'), record
									.get('url'), Ext.getCmp('combo_layer_ZE'));
							Ext.getCmp('combo_layer_ZE').setDisabled(false);
						});
						this.combo_Layers_ZE = GEOR.WPS_Utils.initCombobox(
								'combo_layer_ZE', this.layerStore, OpenLayers
										.i18n("zoneextraction.layername"),
								'layer', 'name', true);

						if (!this.win) {

							this.win = new Ext.Window(
									{
										title : "Configuration",
										height : 200,
										width : 350,
										bodyStyle : 'padding: 5px',
										layout : 'form',
										labelWidth : 110,
										defaultType : 'field',
										items : [

												this.combo_Server_ZE,
												this.combo_Layers_ZE,
												{
													fieldLabel : OpenLayers
															.i18n("zoneextraction.projection"),
													width : 200,
													id : 'projection_ZE',
													allowBlank : false
												},
												{
													fieldLabel : OpenLayers
															.i18n("zoneextraction.ranges"),
													width : 200,
													id : 'ranges_ZE',
													allowBlank : false

												},
												{
													fieldLabel : OpenLayers
															.i18n("zoneextraction.band"),
													width : 200,
													id : 'band_ZE',
													allowBlank : false

												}

										],
										fbar : [
												'->',
												{
													text : OpenLayers
															.i18n("zoneextraction.submit"),
													id : 'submit_ZE',
													formBind : true,

													handler : function() {

														workspace = GEOR.WPS_Utils
																.getWorkspace(
																		Ext
																				.getCmp('combo_layer_ZE'),
																		Ext
																				.getCmp('combo_server_ZE'));
														layerName_ZE = GEOR.WPS_Utils
																.getLayerName(Ext
																		.getCmp('combo_layer_ZE'));

														projectionNumber = Ext
																.getCmp(
																		'projection_ZE')
																.getValue();
														projection = "EPSG:"
																+ projectionNumber;

														ranges = Ext.getCmp(
																'ranges_ZE')
																.getValue();
														band = Ext.getCmp(
																'band_ZE')
																.getValue();

														if (workspace == ""
																|| layerName_ZE == "") {
															Ext.Msg
																	.alert(
																			'Warning',
																			OpenLayers
																					.i18n("zoneextraction.warning.message"));
															return;
														}
														var test = ":";
														concat = workspace
																+ test
																+ layerName_ZE;
														var defStyle = {
															externalGraphic : "https://maps.google.com/mapfiles/kml/shapes/info-i_maps.png",
															graphicWidth : 32,
															graphicHeight : 37,
															graphicYOffset : -37,
															graphicOpacity : 1,
															cursor : "pointer"
														};
														sty = OpenLayers.Util
																.applyDefaults(
																		defStyle,
																		OpenLayers.Feature.Vector.style["default"]);
														sm = new OpenLayers.StyleMap(
																{
																	'default' : sty
																});

														this.win.hide();

														var wms = new OpenLayers.Layer.WMS(
																layerName_ZE,
																GEOR.config.GEOSERVER_WMS_URL,
																{
																	layers : concat,
																	transparent : true,
																},
																{
																	opacity : 0.5,
																	singleTile : true
																});

														map.addLayers([ wms ]);

													},

													scope : this
												} ],
										listeners : {
											"hide" : function() {
											},
											scope : this
										}
									});

						}

						this.win.show();
					},

					/**
					 * * Method: defControl *
					 */
					defControl : function() {
						OpenLayers.Control.Click = OpenLayers
								.Class(
										OpenLayers.Control,
										{
											defaultHandlerOptions : {
												'single' : true,
												'double' : false,
												'pixelTolerance' : 0,
												'stopSingle' : false,
												'stopDouble' : false
											},
											initialize : function(options) {
												this.handlerOptions = OpenLayers.Util
														.extend(
																{},
																this.defaultHandlerOptions);
												OpenLayers.Control.prototype.initialize
														.apply(this, arguments);
												this.handler = new OpenLayers.Handler.Polygon(
														this,
														{
															'done' : this.clickevent
														});
											},
											clickevent : function(p) {

												GEOR.waiter.show();
												if ((typeof (workspace) == 'undefined')
														|| (typeof (layerName_ZE) == 'undefined')) {
													Ext.Msg
															.alert(
																	'Warning',
																	OpenLayers
																			.i18n("zoneextraction.warning.message"));
													selectPolygon.deactivate();
													return;
												}

												// initialize the wps format
												var wpsFormat = new OpenLayers.Format.WPSExecute();
												// transform the polygon
												// projection
												var feat = new OpenLayers.Feature.Vector(
														p);
												var geometry = feat.geometry
														.clone();
												geometry.transform(
														mapProjection,
														projection);
												var wkt = new OpenLayers.Format.WKT();
												var feat2 = new OpenLayers.Feature.Vector(
														geometry);
												var pt = wkt.write(feat2);

												// desactivate the selection
												// point
												selectPolygon.deactivate();

  boundingBox_layer = Ext.getCmp('combo_layer_ZE').getValue().bbox["EPSG:"+ projectionNumber]
                                                                                                if (boundingBox_layer == undefined) {
                                                                                                boundingBox_layer = Ext.getCmp('combo_layer_ZE').getValue().bbox["epsg:"+ projectionNumber]
}

                                                                                                var layer_bbox = boundingBox_layer.bbox;

												var doc = wpsFormat
														.write({
															identifier : "gs:PolygonExtraction",
															dataInputs : [
																	{
																		identifier : 'data',
																		reference : {
																			mimeType : "image/tiff",
																			href : "http://geoserver/wcs",
																			method : "POST",
																			body : {
																				wcs : {
																					identifier : concat,
																					version : '1.1.1',
																					domainSubset : {
																						boundingBox : {
																							projection : 'http://www.opengis.net/gml/srs/epsg.xml#'
																									+ projectionNumber,
																							bounds : new OpenLayers.Bounds(
																									layer_bbox)
																						}
																					},
																					output : {
																						format : 'image/tiff'
																					}
																				}
																			}
																		}
																	},

																	{
																		identifier : "band",
																		data : {
																			literalData : {
																				value : band
																			}
																		}
																	},

																	{
																		identifier : "roi",
																		data : {
																			complexData : {
																				attributes : {
																					mimeType : "application/wkt"
																				},
																				value : pt
																			}
																		}
																	},
																	{
																		identifier : "insideEdges",
																		data : {
																			literalData : {
																				value : "true"
																			}
																		}
																	},

																	{
																		identifier : "ranges",
																		data : {
																			literalData : {
																				value : ranges
																			}
																		}
																	} ],
															responseForm : {
																rawDataOutput : {
																	mimeType : "text/xml",
																	identifier : "result"
																}

															}
														});

												OpenLayers.Request
														.POST({
															url : GEOR.custom.GEOSERVER_WPS_URL,
															data : doc,
															success : function(
																	response) {
																var features = new OpenLayers.Format.WFST.v1_0_0()
																		.read(response.responseText);
																var wfs = new OpenLayers.Layer.Vector(
																		newLayerfeature,
																		{
																			projection : projection,
																			preFeatureInsert : function(
																					feature) {
																				feature.geometry
																						.transform(
																								projection,
																								map
																										.getProjection())
																			}

																		});

																if (features
																		&& (features instanceof OpenLayers.Feature.Vector || features.length)) {
																	wfs
																			.addFeatures(features);
																	this.map
																			.addLayers([ wfs ]);
																} else {
																	Ext.MessageBox
																			.show({
																				title : 'Warning',
																				msg : 'The wps process execution ended with problem',
																				buttons : Ext.MessageBox.OK
																			});
																}
																GEOR.waiter
																		.hide();
															},
															failure : function(
																	response) {
																alert("failure!");
																GEOR.waiter
																		.hide();
															}
														});
											},
											trigger : function(e) {
												var lonlat = map
														.getLonLatFromViewPortPx(e.xy);
												var feat = new OpenLayers.Feature.Vector(
														new OpenLayers.Geometry.Point(
																lonlat.lon,
																lonlat.lat));
												var gml = convertToGML([ feat ]);
												selectPolygon.deactivate();
												this.executeWPS();
											}
										});
					},

					/**destroy the addon*/
					destroy : function() {
						
						GEOR.Addons.Base.prototype.destroy.call(this);

					}
				});
