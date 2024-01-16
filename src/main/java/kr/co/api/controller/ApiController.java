package kr.co.api.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class ApiController {

    @GetMapping("/")
    public String main(){

        return "/main";
    }


    @GetMapping("/view")
    public String view(){

        return "/view";
    }
}
