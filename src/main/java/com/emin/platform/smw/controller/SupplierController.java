package com.emin.platform.smw.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.emin.platform.smw.filter.MenuOperationFilter;
import com.emin.platform.smw.interfaces.CentralConApiFeign;
import com.emin.platform.smw.interfaces.SupplierApiFeign;
@Controller
@RequestMapping("/supplier")
public class SupplierController extends HeaderCommonController {
	//private static final Logger LOGGER = Logger.getLogger(SupplierController.class);
	@Value("${spring.application.code}")
	private String appCode;

	@Autowired
	MenuOperationFilter menuOperationFilter;

	@Autowired
	CentralConApiFeign centralConApiFeign;

	@Autowired
	SupplierApiFeign supplierApiFeign;

	@RequestMapping("/index")
	public ModelAndView index(String type, String keyword) {
		ModelAndView mv = new ModelAndView("modules/supplier/manage");
		JSONObject res = supplierApiFeign.queryAll(type, keyword);
		this.dealException(res);
		mv.addObject("datas", res.getJSONObject("result"));
		JSONObject typesRes = supplierApiFeign.getTypes();
		this.dealException(typesRes);
		mv.addObject("types", typesRes.getJSONArray("result"));
		mv.addObject("type", type);
		mv.addObject("keyword", keyword);
		return mv;
	}
	@RequestMapping("/form")
	public ModelAndView form() {
		ModelAndView mv = new ModelAndView("modules/supplier/form");
		JSONObject typesRes = supplierApiFeign.getTypes();
		this.dealException(typesRes);
		mv.addObject("types", typesRes.getJSONArray("result"));
		return mv;
	}

	@RequestMapping("/detail")
	public ModelAndView detail(Long id) {
		ModelAndView mv = new ModelAndView("modules/supplier/detail");

		if (id != null) {
			JSONObject detailRes = supplierApiFeign.detail(id);
			this.dealException(detailRes);
			JSONObject info = detailRes.getJSONObject("result");
			JSONArray brands = info.getJSONArray("brands");
			JSONObject relateBrands = new JSONObject();
			String current = null;
			for (int i = 0; i < brands.size(); i++) {
				current = brands.getJSONObject(i).getString("systemCode");
				if (!relateBrands.containsKey(current)) {
					JSONArray objs = new JSONArray();
					objs.add(brands.getJSONObject(i));
					relateBrands.put(current, objs);
				} else {
					JSONArray objs = relateBrands.getJSONArray(current);
					objs.add(brands.getJSONObject(i));
				}
			}
			mv.addObject("relateBrands", relateBrands);

			JSONObject sysRes = centralConApiFeign.onlySystem();
			this.dealException(sysRes);
			Integer typeLen = sysRes.getJSONArray("result").size();
			mv.addObject("typeLen", typeLen);
			if (relateBrands.keySet().size() >= typeLen) {
				mv.addObject("overBrand", 1);
			} else {
				mv.addObject("overBrand", 0);
			}
			mv.addObject("info", info);
		}
		return mv;
	}
	@RequestMapping("/basic")
	public ModelAndView basic(Long id) {
		ModelAndView mv = new ModelAndView("modules/supplier/basic");
		JSONObject typesRes = supplierApiFeign.getTypes();
		this.dealException(typesRes);
		mv.addObject("types", typesRes.getJSONArray("result"));
		if (id != null) {
			JSONObject detailRes = supplierApiFeign.detail(id);
			this.dealException(detailRes);
			mv.addObject("info", detailRes.getJSONObject("result"));
		}
		return mv;
	}
	
	@GetMapping("/sys-brands")
	public ModelAndView sysBrands(String systemCode, Long id, Long supplierId) {
		ModelAndView mv = new ModelAndView("modules/supplier/sys-brands");
		JSONObject sysRes = centralConApiFeign.onlySystem();
		this.dealException(sysRes);
		mv.addObject("systems", sysRes.getJSONArray("result"));
		if (systemCode == null || systemCode.isEmpty()) {
			systemCode = sysRes.getJSONArray("result").getJSONObject(0).getString("code");
		}
		mv.addObject("systemCode", systemCode);
		mv.addObject("supplierId", supplierId);
		mv.addObject("id", id);
		
		JSONObject brandsRes = centralConApiFeign.brandsBySysCode(systemCode);
		this.dealException(brandsRes);
		mv.addObject("brands", brandsRes.getJSONArray("result"));

		if (supplierId != null) {
			JSONObject checkedRes = supplierApiFeign.detailBrands(supplierId);
			this.dealException(checkedRes);
			mv.addObject("checked", checkedRes.getJSONArray("result"));
		}
		mv.addObject("nowTime", System.currentTimeMillis());
		return mv;
	}
	

	@RequestMapping("/linkman")
	public ModelAndView linkman(Long id, Long supplierId) {
		ModelAndView mv = new ModelAndView("modules/supplier/linkman");
		mv.addObject("nowTime", System.currentTimeMillis());
		if (id != null) {
			JSONObject linkmanRes = supplierApiFeign.detailLinkman(id);
			this.dealException(linkmanRes);
			mv.addObject("linkman", linkmanRes.getJSONObject("result"));
		}
		mv.addObject("supplierId", supplierId);
		return mv;
	}
	
	@GetMapping("/getBrands")
	@ResponseBody
	public JSONObject getBrands(String systemCode) {
		JSONObject brandsRes = centralConApiFeign.brandsBySysCode(systemCode);
		this.dealException(brandsRes);
		return brandsRes;
	}
	
	@PostMapping("/save")
	@ResponseBody
	public JSONObject save(String data) {
		JSONObject res = supplierApiFeign.save(data);
		this.dealException(res);
		return res;
	}
	
	@PostMapping("/remove")
	@ResponseBody
	public JSONObject remove(Long id, String code) {
		JSONObject res = supplierApiFeign.remove(id, code);
		this.dealException(res);
		return res;
	}
	
	@PostMapping("/updateBasic")
	@ResponseBody
	public JSONObject updateBasic(String data) {
		JSONObject res = supplierApiFeign.updateBasic(data);
		this.dealException(res);
		return res;
	}
	

	@PostMapping("/addBrand")
	@ResponseBody
	public JSONObject addBrand(String data, Long supplierId) {
		JSONObject res = supplierApiFeign.addBrand(data, supplierId);
		this.dealException(res);
		return res;
	}
	@PostMapping("/updateBrand")
	@ResponseBody
	public JSONObject updateBrand(String data, Long supplierId, String systemCode) {
		JSONObject res = supplierApiFeign.updateBrand(data, supplierId, systemCode);
		this.dealException(res);
		return res;
	}
	@PostMapping("/removeBrand")
	@ResponseBody
	public JSONObject removeBrand(String code, Long supplierId) {
		JSONObject res = supplierApiFeign.removeBrand(code, supplierId);
		this.dealException(res);
		return res;
	}
	@PostMapping("/removeLinkman")
	@ResponseBody
	public JSONObject removeLinkman(Long id) {
		JSONObject res = supplierApiFeign.removeLinkman(id);
		this.dealException(res);
		return res;
	}

	@PostMapping("/addLinkman")
	@ResponseBody
	public JSONObject addLinkman(String data, Long supplierId) {
		JSONObject res = supplierApiFeign.addLinkman(data, supplierId);
		this.dealException(res);
		return res;
	}
	@PostMapping("/updateLinkman")
	@ResponseBody
	public JSONObject updateLinkman(String data) {
		JSONObject res = supplierApiFeign.updateLinkman(data);
		this.dealException(res);
		return res;
	}
	
	@PostMapping("/majorLinkman")
	@ResponseBody
	public JSONObject majorLinkman(Long id, boolean isMajor) {
		JSONObject res = supplierApiFeign.topLinkman(id, isMajor);
		this.dealException(res);
		return res;
	}
}