<?

class Component_mail extends Component {
  public static $default_transport = "virtual:";
  public static $default_vuid = "2001";
  public static $default_vgid = "2001";

  function init() {
    $this->orm = OrmManager::singleton();
    $this->orm->LoadModel("mail");
  }

  function controller_mail($args) {
    $vars["args"] = $args;
    if (!empty($args["domain"])) {
      $vars["domainname"] = $args["domain"];
    }
    return $this->GetComponentResponse("./mail.tpl", $vars);
  }
  function controller_domains($args) {
    if (!User::authorized("mail"))
      throw new Exception("not allowed");
    $vars["domains"] = $this->orm->select("MailDomain");
    return $this->GetComponentResponse("./domains.tpl", $vars);
  }
  function controller_domain($args) {
    if (!User::authorized("mail"))
      throw new Exception("not allowed");
    $vars["domain"] = any($args["domain"], $args["item"]);
    if (empty($vars["domain"]) && !empty($args["domainname"])) {
      $vars["domain"] = $this->orm->Load("MailDomain", $args["domainname"]);
    }
    $vars["showaccounts"] = any($args["showaccounts"], false);
    if (!empty($vars["domain"]) && !empty($vars["showaccounts"])) {
      $vars["accounts"] = $vars["domain"]->GetMailAccounts("ORDER BY username");
    }
    return $this->GetComponentResponse("./domain.tpl", $vars);
  }
  function controller_domain_create($args) {
    if (!User::authorized("mail"))
      throw new Exception("not allowed");
    $domain = new MailDomain();
    if (!empty($args["domain"])) {
      $transport = any($args["transport"], self::$default_transport);
      $domain->domain = $args["domain"];
      $domain->transport = $transport;
      try {
        $vars["success"] = 1;
        $this->orm->save($domain);
        header("Location: /elation/mail/");
      } catch(Exception $e) {
        $vars["success"] = 0;
      }
    }
    return $this->GetComponentResponse("./domain_create.tpl", $vars);
  }
  function controller_accounts($args) {
    if (!User::authorized("mail"))
      throw new Exception("not allowed");
    $vars["accounts"] = $args["accounts"];
    return $this->GetComponentResponse("./accounts.tpl", $vars);
  }
  function controller_account($args) {
    if (!User::authorized("mail"))
      throw new Exception("not allowed");
    $vars["account"] = any($args["account"], $args["item"]);
    return $this->GetComponentResponse("./account.tpl", $vars);
  }
  function controller_account_create($args) {
    if (!User::authorized("mail"))
      throw new Exception("not allowed");
    $vars["account"] = new MailAccount();
    if (!empty($args["domain"])) {
      $vars["account"]->domain = $args["domain"]->domain;
    }
    if (!empty($args["account"])) {
      foreach ($args["account"] as $k=>$v) {
        $vars["account"]->{$k} = ($k == "pass" && !empty($v) ? md5($v) : $v);
      }
      $vars["success"] = 0;
      // FIXME - this is ugly and could just be done with $vars["account"]->isValid() if we cleaned up validators
      if ((!empty($vars["account"]->username) && !empty($vars["account"]->domain)) &&
           (
             (!empty($vars["account"]->forward) && empty($vars["account"]->pass)) ||
             (!empty($vars["account"]->pass) && empty($vars["account"]->forward))
           )
         ) {
        if (empty($vars["account"]->forward))
          $vars["account"]->maildir = "_virtual_/" . $vars["account"]->domain . "/" . $vars["account"]->username . "/";
        try {
          $this->orm->save($vars["account"]);
          $vars["success"] = 1;
          header("Location: /elation/mail/?domain=".urlencode($vars["account"]->domain));
        } catch (Exception $e) {
        }
      } else {
      }
    }
    return $this->GetComponentResponse("./account_create.tpl", $vars);
  }
}  
