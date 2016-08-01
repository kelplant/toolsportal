<?php
namespace AppBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use AppBundle\Form\UserType;
use AppBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class UserController
 * @package AppBundle\Controller
 */
class UserController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('User', 'app', '', User::class, UserType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('User');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(User::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(UserType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('ce user');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('app');
        $this->get('core.'.$service.'.controller_service')->setBundleName('');
    }

    /**
     * @Route(path="/repair/user", name="liste_user")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/repair/user/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_user")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('app.user_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/repair/user/add", name="form_exec_add_user")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_addAction(Request $request)
    {
        $this->initData('add');
        $this->initData('index');
        return $this->get('core.add.controller_service')->executeRequestAddAction($request);
    }

    /**
     * @param Request $request
     * @Route(path="/repair/user/edit", name="form_exec_edit_user")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }

    /**
     * @param $itemLoad
     * @Route(path="/ajax/user/get/{itemLoad}", name="ajax_get_user_info")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function ajaxGetTicket($itemLoad)
    {
        return new JsonResponse($this->get('app.user_manager')->createArray($itemLoad));
    }
}