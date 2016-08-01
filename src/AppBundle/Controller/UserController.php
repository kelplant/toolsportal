<?php
namespace AppBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use AppBundle\Form\UserType;
use AppBundle\Entity\User;
use FOS\UserBundle\Event\FilterUserResponseEvent;
use FOS\UserBundle\Event\GetResponseUserEvent;
use FOS\UserBundle\FOSUserEvents;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
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
     * @Route(path="/divers/user", name="liste_user")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        /** @var $formFactory \FOS\UserBundle\Form\Factory\FactoryInterface */
        $formFactory = $this->get('fos_user.registration.form.factory');
        $this->formAdd = $formFactory->createForm();
        $this->formEdit = $this->generateForm();

        return $this->get('core.index.controller_service')->getFullList('0', $this->formAdd, $this->formEdit);
    }

    /**
     * @param Request $request
     * @Route(path="/divers/user/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_user")
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
     * @Route(path="/divers/user/add", name="form_exec_add_user")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_addAction(Request $request)
    {
        /** @var $formFactory \FOS\UserBundle\Form\Factory\FactoryInterface */
        $formFactory = $this->get('fos_user.registration.form.factory');
        /** @var $userManager \FOS\UserBundle\Model\UserManagerInterface */
        $userManager = $this->get('fos_user.user_manager');
        /** @var $dispatcher \Symfony\Component\EventDispatcher\EventDispatcherInterface */
        $dispatcher = $this->get('event_dispatcher');

        $user = $userManager->createUser();
        $user->setEnabled(true);

        $event = new GetResponseUserEvent($user, $request);
        $dispatcher->dispatch(FOSUserEvents::REGISTRATION_INITIALIZE, $event);

        if (null !== $event->getResponse()) {
            return $event->getResponse();
        }

        $form = $formFactory->createForm();
        $form->setData($user);

        $form->handleRequest($request);

        if ($form->isValid()) {
            $event = new FormEvent($form, $request);
            $dispatcher->dispatch(FOSUserEvents::REGISTRATION_SUCCESS, $event);

            $userManager->updateUser($user);

            $url = $this->generateUrl('liste_user');
            $response = new RedirectResponse($url);

            return $response;
        }

        return $this->render('AppBundle:User:view.html.twig', array(
            'form' => $form->createView(),
        ));
    }

    /**
     * @param Request $request
     * @Route(path="/divers/user/edit", name="form_exec_edit_user")
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