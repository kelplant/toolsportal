<?php
namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class HomeController
 * @package AppBundle\Controller
 */
class HomeController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function homeAction()
    {
        if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {

            if ($this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
                return $this->redirect($this->generateUrl('homepage_hello'));
            }
            if ($this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
                return $this->render('@App/Default/noaccess.view.html.twig');
            }
        }
        return $this->redirect($this->generateUrl('fos_user_security_login'));
    }

    /**
     * @Route("/hello", name="homepage_hello")
     */
    public function homeHelloAction()
    {
        $session_messaging = $this->get('session')->get('messaging');
        $this->get('session')->set('messaging', []);
        $globalAlertColor = $this->get('core.index.controller_service')->getGlobalAlertColor($session_messaging);
        $userInfos = $this->get('security.token_storage')->getToken()->getUser();

        return $this->render('@ProserviaOrdresLivraison/Default/index.html.twig', array(
            'entity'                        => '', 'session_messaging' => $session_messaging, 'globalAlertColor' => $globalAlertColor,
            'panel'                         => 'admin',
            'currentUserInfos'              => $userInfos,
            'remaining_gmail_licenses'      => $this->get('app.parameters_calls')->getParam('remaining_google_licenses'),
            'remaining_salesforce_licenses' => $this->get('app.parameters_calls')->getParam('remaining_licences_type_Salesforce'),
        ));

    }
}